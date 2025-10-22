import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { productReviews, products, orders } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const adminReviewsRouter = new Hono();

// GET /api/admin/reviews - Get all reviews (admin only)
adminReviewsRouter.get("/", authMiddleware, async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const status = c.req.query("status") as string;
    
    const offset = (page - 1) * limit;
    
    // Build the query conditionally based on status filter
    let reviewList;
    let totalCountResult;
    
    if (status === 'verified') {
      // Get only verified reviews
      reviewList = await db.select({
        id: productReviews.id,
        productId: productReviews.productId,
        customerId: productReviews.customerId,
        orderId: productReviews.orderId,
        customerName: productReviews.customerName,
        rating: productReviews.rating,
        comment: productReviews.comment,
        date: productReviews.date,
        verified: productReviews.verified,
        createdAt: productReviews.createdAt,
        updatedAt: productReviews.updatedAt,
        productName: products.name,
        orderNumber: orders.orderNumber
      })
        .from(productReviews)
        .leftJoin(products, eq(productReviews.productId, products.id))
        .leftJoin(orders, eq(productReviews.orderId, orders.id))
        .where(eq(productReviews.verified, true))
        .orderBy(desc(productReviews.createdAt))
        .limit(limit)
        .offset(offset);
      
      totalCountResult = await db.select({ count: sql<number>`count(*)`.as('count') })
        .from(productReviews)
        .where(eq(productReviews.verified, true));
    } else if (status === 'unverified') {
      // Get only unverified reviews
      reviewList = await db.select({
        id: productReviews.id,
        productId: productReviews.productId,
        customerId: productReviews.customerId,
        orderId: productReviews.orderId,
        customerName: productReviews.customerName,
        rating: productReviews.rating,
        comment: productReviews.comment,
        date: productReviews.date,
        verified: productReviews.verified,
        createdAt: productReviews.createdAt,
        updatedAt: productReviews.updatedAt,
        productName: products.name,
        orderNumber: orders.orderNumber
      })
        .from(productReviews)
        .leftJoin(products, eq(productReviews.productId, products.id))
        .leftJoin(orders, eq(productReviews.orderId, orders.id))
        .where(eq(productReviews.verified, false))
        .orderBy(desc(productReviews.createdAt))
        .limit(limit)
        .offset(offset);
      
      totalCountResult = await db.select({ count: sql<number>`count(*)`.as('count') })
        .from(productReviews)
        .where(eq(productReviews.verified, false));
    } else {
      // Get all reviews
      reviewList = await db.select({
        id: productReviews.id,
        productId: productReviews.productId,
        customerId: productReviews.customerId,
        orderId: productReviews.orderId,
        customerName: productReviews.customerName,
        rating: productReviews.rating,
        comment: productReviews.comment,
        date: productReviews.date,
        verified: productReviews.verified,
        createdAt: productReviews.createdAt,
        updatedAt: productReviews.updatedAt,
        productName: products.name,
        orderNumber: orders.orderNumber
      })
        .from(productReviews)
        .leftJoin(products, eq(productReviews.productId, products.id))
        .leftJoin(orders, eq(productReviews.orderId, orders.id))
        .orderBy(desc(productReviews.createdAt))
        .limit(limit)
        .offset(offset);
      
      totalCountResult = await db.select({ count: sql<number>`count(*)`.as('count') })
        .from(productReviews);
    }
    
    const totalCount = totalCountResult[0].count;
    
    return c.json({
      success: true,
      data: {
        reviews: reviewList,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error("Get admin reviews error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

export default adminReviewsRouter;