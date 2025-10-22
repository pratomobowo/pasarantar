import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { customers, customerSocialAccounts, orders } from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const adminCustomersRouter = new Hono();

// Update profile schema
const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  whatsapp: z.string().optional(),
  address: z.string().max(1000).optional(),
  coordinates: z.string().max(100).optional(),
});

// GET /api/admin/customers - Get all customers with pagination and search
adminCustomersRouter.get("/", authMiddleware, async (c) => {
  try {
    console.log("Admin customers endpoint called");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const search = c.req.query("search") || "";
    
    console.log(`Fetching customers: page=${page}, limit=${limit}, search=${search}`);
    
    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions: any[] = [];
    
    if (search) {
      whereConditions.push(
        sql`(LOWER(${customers.name}) LIKE ${'%' + search.toLowerCase() + '%'} OR LOWER(${customers.email}) LIKE ${'%' + search.toLowerCase() + '%'})`
      );
    }
    
    // Get customers
    const customerList = await db.select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      whatsapp: customers.whatsapp,
      address: customers.address,
      avatarUrl: customers.avatarUrl,
      provider: customers.provider,
      emailVerified: customers.emailVerified,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt
    })
      .from(customers)
      .where(whereConditions.length > 0 ? and(...whereConditions) : sql`1=1`)
      .orderBy(desc(customers.createdAt))
      .limit(limit)
      .offset(offset);
    
    console.log(`Found ${customerList.length} customers`);
    
    // Get total count
    const totalCount = await db.select({ count: sql<number>`count(*)`.as('count') })
      .from(customers)
      .where(whereConditions.length > 0 ? and(...whereConditions) : sql`1=1`);
    
    console.log(`Total customers: ${totalCount[0].count}`);
    
    const response = {
      success: true,
      data: {
        customers: customerList,
        pagination: {
          page,
          limit,
          total: totalCount[0].count,
          totalPages: Math.ceil(totalCount[0].count / limit)
        }
      }
    };
    
    console.log("Returning response:", JSON.stringify(response, null, 2));
    
    return c.json(response);
    
  } catch (error) {
    console.error("Get customers error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/admin/customers/:id - Get specific customer
adminCustomersRouter.get("/:id", authMiddleware, async (c) => {
  try {
    const customerId = c.req.param("id");
    
    // Get customer info
    const customerList = await db.select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      whatsapp: customers.whatsapp,
      address: customers.address,
      coordinates: customers.coordinates,
      avatarUrl: customers.avatarUrl,
      provider: customers.provider,
      providerId: customers.providerId,
      emailVerified: customers.emailVerified,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt
    })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    
    if (customerList.length === 0) {
      return c.json({
        success: false,
        message: "Customer not found"
      }, 404);
    }
    
    const customer = customerList[0];
    
    // Get social accounts
    const socialAccounts = await db.select()
      .from(customerSocialAccounts)
      .where(eq(customerSocialAccounts.customerId, customerId));
    
    // Get customer's order count
    const orderCount = await db.select({ count: sql<number>`count(*)`.as('count') })
      .from(orders)
      .where(eq(orders.customerId, customerId));
    
    // Get customer's total spent
    const totalSpent = await db.select({ total: sql<number>`sum(total_amount)`.as('total') })
      .from(orders)
      .where(and(
        eq(orders.customerId, customerId),
        eq(orders.status, 'delivered')
      ));
    
    return c.json({
      success: true,
      data: {
        ...customer,
        socialAccounts,
        stats: {
          totalOrders: orderCount[0].count,
          totalSpent: totalSpent[0].total || 0
        }
      }
    });
    
  } catch (error) {
    console.error("Get customer error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PUT /api/admin/customers/:id - Update customer
adminCustomersRouter.put("/:id", authMiddleware, async (c) => {
  try {
    const customerId = c.req.param("id");
    const body = await c.req.json();
    const data = updateProfileSchema.parse(body);
    
    // Check if customer exists
    const existingCustomer = await db.select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    
    if (existingCustomer.length === 0) {
      return c.json({
        success: false,
        message: "Customer not found"
      }, 404);
    }
    
    // Update customer
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.coordinates !== undefined) updateData.coordinates = data.coordinates;
    
    await db.update(customers)
      .set(updateData)
      .where(eq(customers.id, customerId));
    
    // Get updated customer info
    const updatedCustomerList = await db.select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      whatsapp: customers.whatsapp,
      address: customers.address,
      coordinates: customers.coordinates,
      avatarUrl: customers.avatarUrl,
      provider: customers.provider,
      providerId: customers.providerId,
      emailVerified: customers.emailVerified,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt
    })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    
    const updatedCustomer = updatedCustomerList[0];
    
    return c.json({
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer
    });
    
  } catch (error) {
    console.error("Update customer error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// DELETE /api/admin/customers/:id - Delete customer
adminCustomersRouter.delete("/:id", authMiddleware, async (c) => {
  try {
    const customerId = c.req.param("id");
    
    // Check if customer exists
    const existingCustomer = await db.select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    
    if (existingCustomer.length === 0) {
      return c.json({
        success: false,
        message: "Customer not found"
      }, 404);
    }
    
    // Delete customer (cascade delete should handle related records)
    await db.delete(customers)
      .where(eq(customers.id, customerId));
    
    return c.json({
      success: true,
      message: "Customer deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete customer error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

export default adminCustomersRouter;