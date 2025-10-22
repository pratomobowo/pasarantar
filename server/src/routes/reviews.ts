import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { productReviews, products, orders, orderItems } from "../db/schema";
import { eq, and, desc, sql, avg } from "drizzle-orm";
import { generateId } from "../utils/auth";
import { customerAuthMiddleware } from "../middleware/customerAuth";
import { authMiddleware } from "../middleware/auth";

const reviewsRouter = new Hono();

// Review creation schema
const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  orderId: z.string().min(1, "Order ID is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().min(1, "Comment is required").max(1000, "Comment must be less than 1000 characters"),
});

// Review update schema
const updateReviewSchema = z.object({
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5").optional(),
  comment: z.string().min(1, "Comment is required").max(1000, "Comment must be less than 1000 characters").optional(),
});

// POST /api/reviews - Create new review (customer only)
reviewsRouter.post("/", customerAuthMiddleware, async (c) => {
  try {
    const { customerId } = (c as any).get("customer");
    const body = await c.req.json();
    const data = createReviewSchema.parse(body);
    
    // Verify that the order belongs to the customer and is delivered
    const orderList = await db.select()
      .from(orders)
      .where(and(
        eq(orders.id, data.orderId),
        eq(orders.customerId, customerId),
        eq(orders.status, 'delivered')
      ))
      .limit(1);
    
    if (orderList.length === 0) {
      return c.json({
        success: false,
        message: "Order not found or not eligible for review"
      }, 404);
    }
    
    // Verify that the product is in the order
    const orderItemList = await db.select()
      .from(orderItems)
      .where(and(
        eq(orderItems.orderId, data.orderId),
        eq(orderItems.productId, data.productId)
      ))
      .limit(1);
    
    if (orderItemList.length === 0) {
      return c.json({
        success: false,
        message: "Product not found in this order"
      }, 404);
    }
    
    // Check if review already exists
    const existingReview = await db.select()
      .from(productReviews)
      .where(and(
        eq(productReviews.customerId, customerId),
        eq(productReviews.orderId, data.orderId),
        eq(productReviews.productId, data.productId)
      ))
      .limit(1);
    
    if (existingReview.length > 0) {
      return c.json({
        success: false,
        message: "Review already exists for this product in this order"
      }, 400);
    }
    
    // Get customer name
    const customerList = await db.select({ name: orders.customerName })
      .from(orders)
      .where(eq(orders.id, data.orderId))
      .limit(1);
    
    const customerName = customerList[0]?.name || "Anonymous";
    
    // Create new review
    const newReview = {
      id: generateId(),
      productId: data.productId,
      customerId,
      orderId: data.orderId,
      customerName,
      rating: data.rating,
      comment: data.comment,
      date: new Date().toISOString().split('T')[0],
      verified: true, // Auto-verify since it's from a completed order
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(productReviews).values(newReview);
    
    // Update product rating and review count
    await updateProductRating(data.productId);
    
    return c.json({
      success: true,
      message: "Review created successfully",
      data: newReview
    });
    
  } catch (error) {
    console.error("Create review error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/reviews/check - Check if review exists for a product in an order
reviewsRouter.get("/check", customerAuthMiddleware, async (c) => {
  try {
    const { customerId } = (c as any).get("customer");
    const productId = c.req.query("productId") as string;
    const orderId = c.req.query("orderId") as string;
    
    if (!productId || !orderId) {
      return c.json({
        success: false,
        message: "Product ID and Order ID are required"
      }, 400);
    }
    
    // Check if review exists
    const existingReview = await db.select()
      .from(productReviews)
      .where(and(
        eq(productReviews.customerId, customerId),
        eq(productReviews.orderId, orderId),
        eq(productReviews.productId, productId)
      ))
      .limit(1);
    
    return c.json({
      success: true,
      exists: existingReview.length > 0,
      review: existingReview.length > 0 ? existingReview[0] : null
    });
  } catch (error) {
    console.error("Check review error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/reviews/product/:productId - Get reviews for a product
reviewsRouter.get("/product/:productId", async (c) => {
  try {
    const productId = c.req.param("productId");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    
    const offset = (page - 1) * limit;
    
    // Get reviews
    const reviewList = await db.select()
      .from(productReviews)
      .where(eq(productReviews.productId, productId))
      .orderBy(desc(productReviews.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get total count
    const totalCount = await db.select({ count: sql<number>`count(*)`.as('count') })
      .from(productReviews)
      .where(eq(productReviews.productId, productId));
    
    return c.json({
      success: true,
      data: {
        reviews: reviewList,
        pagination: {
          page,
          limit,
          total: totalCount[0].count,
          totalPages: Math.ceil(totalCount[0].count / limit)
        }
      }
    });
    
  } catch (error) {
    console.error("Get reviews error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/reviews/customer/:customerId - Get reviews by customer (admin only)
reviewsRouter.get("/customer/:customerId", authMiddleware, async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    
    const offset = (page - 1) * limit;
    
    // Get reviews
    const reviewList = await db.select()
      .from(productReviews)
      .where(eq(productReviews.customerId, customerId))
      .orderBy(desc(productReviews.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get total count
    const totalCount = await db.select({ count: sql<number>`count(*)`.as('count') })
      .from(productReviews)
      .where(eq(productReviews.customerId, customerId));
    
    return c.json({
      success: true,
      data: {
        reviews: reviewList,
        pagination: {
          page,
          limit,
          total: totalCount[0].count,
          totalPages: Math.ceil(totalCount[0].count / limit)
        }
      }
    });
    
  } catch (error) {
    console.error("Get customer reviews error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PUT /api/reviews/:id - Update review (customer only, only their own reviews)
reviewsRouter.put("/:id", customerAuthMiddleware, async (c) => {
  try {
    const { customerId } = (c as any).get("customer");
    const reviewId = c.req.param("id");
    const body = await c.req.json();
    const data = updateReviewSchema.parse(body);
    
    // Check if review exists and belongs to the customer
    const existingReview = await db.select()
      .from(productReviews)
      .where(and(
        eq(productReviews.id, reviewId),
        eq(productReviews.customerId, customerId)
      ))
      .limit(1);
    
    if (existingReview.length === 0) {
      return c.json({
        success: false,
        message: "Review not found or you don't have permission to update it"
      }, 404);
    }
    
    // Update review
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.comment !== undefined) updateData.comment = data.comment;
    
    await db.update(productReviews)
      .set(updateData)
      .where(eq(productReviews.id, reviewId));
    
    // Update product rating
    await updateProductRating(existingReview[0].productId);
    
    // Get updated review
    const updatedReviewList = await db.select()
      .from(productReviews)
      .where(eq(productReviews.id, reviewId))
      .limit(1);
    
    return c.json({
      success: true,
      message: "Review updated successfully",
      data: updatedReviewList[0]
    });
    
  } catch (error) {
    console.error("Update review error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// DELETE /api/reviews/:id - Delete review (admin only)
reviewsRouter.delete("/:id", authMiddleware, async (c) => {
  try {
    const reviewId = c.req.param("id");
    
    // Check if review exists
    const existingReview = await db.select()
      .from(productReviews)
      .where(eq(productReviews.id, reviewId))
      .limit(1);
    
    if (existingReview.length === 0) {
      return c.json({
        success: false,
        message: "Review not found"
      }, 404);
    }
    
    const productId = existingReview[0].productId;
    
    // Delete review
    await db.delete(productReviews)
      .where(eq(productReviews.id, reviewId));
    
    // Update product rating
    await updateProductRating(productId);
    
    return c.json({
      success: true,
      message: "Review deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete review error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PATCH /api/reviews/:id/verify - Verify review (admin only)
reviewsRouter.patch("/:id/verify", authMiddleware, async (c) => {
  try {
    const reviewId = c.req.param("id");
    
    // Check if review exists
    const existingReview = await db.select()
      .from(productReviews)
      .where(eq(productReviews.id, reviewId))
      .limit(1);
    
    if (existingReview.length === 0) {
      return c.json({
        success: false,
        message: "Review not found"
      }, 404);
    }
    
    // Update review verification status
    await db.update(productReviews)
      .set({ verified: true, updatedAt: new Date() })
      .where(eq(productReviews.id, reviewId));
    
    return c.json({
      success: true,
      message: "Review verified successfully"
    });
    
  } catch (error) {
    console.error("Verify review error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// Helper function to update product rating
async function updateProductRating(productId: string) {
  try {
    // Calculate new average rating and review count
    const ratingStats = await db.select({
      averageRating: avg(productReviews.rating).as('averageRating'),
      reviewCount: sql<number>`count(*)`.as('reviewCount')
    })
      .from(productReviews)
      .where(eq(productReviews.productId, productId));
    
    const stats = ratingStats[0];
    
    // Add logging to debug the type issue
    console.log("DEBUG: ratingStats =", ratingStats);
    console.log("DEBUG: stats =", stats);
    console.log("DEBUG: stats.averageRating =", stats?.averageRating);
    console.log("DEBUG: typeof stats.averageRating =", typeof stats?.averageRating);
    console.log("DEBUG: stats.reviewCount =", stats?.reviewCount);
    console.log("DEBUG: typeof stats.reviewCount =", typeof stats?.reviewCount);
    
    if (stats && stats.reviewCount > 0) {
      // Add type assertion to fix the arithmetic operation
      const averageRating = Number(stats.averageRating || 0);
      console.log("DEBUG: converted averageRating =", averageRating);
      console.log("DEBUG: typeof converted averageRating =", typeof averageRating);
      
      // Update product with new rating
      await db.update(products)
        .set({
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
          reviewCount: stats.reviewCount,
          updatedAt: new Date()
        })
        .where(eq(products.id, productId));
    } else {
      // No reviews, reset to default
      await db.update(products)
        .set({
          rating: 0,
          reviewCount: 0,
          updatedAt: new Date()
        })
        .where(eq(products.id, productId));
    }
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
}

export default reviewsRouter;