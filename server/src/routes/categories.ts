import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { categories } from "../db/schema";
import { eq, desc, like } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { generateId } from "../utils/auth";

const categoriesRouter = new Hono();

// Category schema
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

// GET /api/admin/categories - Get all categories
categoriesRouter.get("/", authMiddleware, async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const search = c.req.query("search") || "";
    
    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(like(categories.name, `%${search}%`));
    }
    
    const whereClause = whereConditions.length > 0 ? 
      whereConditions.reduce((acc, condition) => acc && condition) : undefined;
    
    // Get categories
    const categoryList = await db.select()
      .from(categories)
      .where(whereClause)
      .orderBy(desc(categories.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get total count
    const totalCount = await db.select({ count: categories.id })
      .from(categories)
      .where(whereClause);
    
    return c.json({
      success: true,
      data: {
        categories: categoryList,
        pagination: {
          page,
          limit,
          total: totalCount.length,
          totalPages: Math.ceil(totalCount.length / limit)
        }
      }
    });
    
  } catch (error) {
    console.error("Get categories error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/admin/categories/:id - Get single category
categoriesRouter.get("/:id", authMiddleware, async (c) => {
  try {
    const categoryId = c.req.param("id");
    
    const categoryList = await db.select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);
    
    if (categoryList.length === 0) {
      return c.json({
        success: false,
        message: "Category not found"
      }, 404);
    }
    
    return c.json({
      success: true,
      data: categoryList[0]
    });
    
  } catch (error) {
    console.error("Get category error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/admin/categories/active - Get active categories (for dropdowns)
categoriesRouter.get("/active/list", authMiddleware, async (c) => {
  try {
    const activeCategories = await db.select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.name);
    
    return c.json({
      success: true,
      data: activeCategories
    });
    
  } catch (error) {
    console.error("Get active categories error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// POST /api/admin/categories - Create new category
categoriesRouter.post("/", authMiddleware, async (c) => {
  try {
    const data = await c.req.json();
    const validatedData = categorySchema.parse(data);
    const categoryId = generateId();
    
    // Check if category name already exists
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.name, validatedData.name))
      .limit(1);
    
    if (existingCategory.length > 0) {
      return c.json({
        success: false,
        message: "Category name already exists"
      }, 400);
    }
    
    // Create category
    const newCategory = {
      id: categoryId,
      name: validatedData.name,
      description: validatedData.description,
      imageUrl: validatedData.imageUrl,
      isActive: validatedData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(categories).values(newCategory);
    
    return c.json({
      success: true,
      message: "Category created successfully",
      data: newCategory
    });
    
  } catch (error) {
    console.error("Create category error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PUT /api/admin/categories/:id - Update category
categoriesRouter.put("/:id", authMiddleware, async (c) => {
  try {
    const categoryId = c.req.param("id");
    const data = await c.req.json();
    const validatedData = categorySchema.parse(data);
    
    // Check if category exists
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);
    
    if (existingCategory.length === 0) {
      return c.json({
        success: false,
        message: "Category not found"
      }, 404);
    }
    
    // Check if category name already exists (excluding current category)
    const duplicateCategory = await db.select()
      .from(categories)
      .where(eq(categories.name, validatedData.name))
      .limit(1);
    
    if (duplicateCategory.length > 0 && duplicateCategory[0].id !== categoryId) {
      return c.json({
        success: false,
        message: "Category name already exists"
      }, 400);
    }
    
    // Update category
    const updatedCategory = {
      name: validatedData.name,
      description: validatedData.description,
      imageUrl: validatedData.imageUrl,
      isActive: validatedData.isActive,
      updatedAt: new Date(),
    };
    
    await db.update(categories)
      .set(updatedCategory)
      .where(eq(categories.id, categoryId));
    
    return c.json({
      success: true,
      message: "Category updated successfully",
      data: {
        id: categoryId,
        ...updatedCategory
      }
    });
    
  } catch (error) {
    console.error("Update category error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// DELETE /api/admin/categories/:id - Delete category
categoriesRouter.delete("/:id", authMiddleware, async (c) => {
  try {
    const categoryId = c.req.param("id");
    
    // Check if category exists
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);
    
    if (existingCategory.length === 0) {
      return c.json({
        success: false,
        message: "Category not found"
      }, 404);
    }
    
    // TODO: Check if category is being used by products
    // For now, we'll allow deletion but in production you might want to prevent it
    
    // Delete category
    await db.delete(categories)
      .where(eq(categories.id, categoryId));
    
    return c.json({
      success: true,
      message: "Category deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete category error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

export default categoriesRouter;