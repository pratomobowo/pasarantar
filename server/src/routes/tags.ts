import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { tags } from "../db/schema";
import { eq, desc, like } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { generateId } from "../utils/auth";

const tagsRouter = new Hono();

// Tag schema
const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color").default("#3B82F6"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET /api/admin/tags - Get all tags
tagsRouter.get("/", authMiddleware, async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const search = c.req.query("search") || "";
    
    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(like(tags.name, `%${search}%`));
    }
    
    const whereClause = whereConditions.length > 0 ? 
      whereConditions.reduce((acc, condition) => acc && condition) : undefined;
    
    // Get tags
    const tagList = await db.select()
      .from(tags)
      .where(whereClause)
      .orderBy(desc(tags.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get total count
    const totalCount = await db.select({ count: tags.id })
      .from(tags)
      .where(whereClause);
    
    return c.json({
      success: true,
      data: {
        tags: tagList,
        pagination: {
          page,
          limit,
          total: totalCount.length,
          totalPages: Math.ceil(totalCount.length / limit)
        }
      }
    });
    
  } catch (error) {
    console.error("Get tags error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/admin/tags/:id - Get single tag
tagsRouter.get("/:id", authMiddleware, async (c) => {
  try {
    const tagId = c.req.param("id");
    
    const tagList = await db.select()
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1);
    
    if (tagList.length === 0) {
      return c.json({
        success: false,
        message: "Tag not found"
      }, 404);
    }
    
    return c.json({
      success: true,
      data: tagList[0]
    });
    
  } catch (error) {
    console.error("Get tag error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/admin/tags/active - Get active tags (for dropdowns)
tagsRouter.get("/active/list", authMiddleware, async (c) => {
  try {
    const activeTags = await db.select()
      .from(tags)
      .where(eq(tags.isActive, true))
      .orderBy(tags.name);
    
    return c.json({
      success: true,
      data: activeTags
    });
    
  } catch (error) {
    console.error("Get active tags error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// POST /api/admin/tags - Create new tag
tagsRouter.post("/", authMiddleware, async (c) => {
  try {
    const data = await c.req.json();
    const validatedData = tagSchema.parse(data);
    const tagId = generateId();
    
    // Check if tag name already exists
    const existingTag = await db.select()
      .from(tags)
      .where(eq(tags.name, validatedData.name))
      .limit(1);
    
    if (existingTag.length > 0) {
      return c.json({
        success: false,
        message: "Tag name already exists"
      }, 400);
    }
    
    // Create tag
    const newTag = {
      id: tagId,
      name: validatedData.name,
      color: validatedData.color,
      description: validatedData.description,
      isActive: validatedData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(tags).values(newTag);
    
    return c.json({
      success: true,
      message: "Tag created successfully",
      data: newTag
    });
    
  } catch (error) {
    console.error("Create tag error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PUT /api/admin/tags/:id - Update tag
tagsRouter.put("/:id", authMiddleware, async (c) => {
  try {
    const tagId = c.req.param("id");
    const data = await c.req.json();
    const validatedData = tagSchema.parse(data);
    
    // Check if tag exists
    const existingTag = await db.select()
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1);
    
    if (existingTag.length === 0) {
      return c.json({
        success: false,
        message: "Tag not found"
      }, 404);
    }
    
    // Check if tag name already exists (excluding current tag)
    const duplicateTag = await db.select()
      .from(tags)
      .where(eq(tags.name, validatedData.name))
      .limit(1);
    
    if (duplicateTag.length > 0 && duplicateTag[0].id !== tagId) {
      return c.json({
        success: false,
        message: "Tag name already exists"
      }, 400);
    }
    
    // Update tag
    const updatedTag = {
      name: validatedData.name,
      color: validatedData.color,
      description: validatedData.description,
      isActive: validatedData.isActive,
      updatedAt: new Date(),
    };
    
    await db.update(tags)
      .set(updatedTag)
      .where(eq(tags.id, tagId));
    
    return c.json({
      success: true,
      message: "Tag updated successfully",
      data: {
        id: tagId,
        ...updatedTag
      }
    });
    
  } catch (error) {
    console.error("Update tag error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// DELETE /api/admin/tags/:id - Delete tag
tagsRouter.delete("/:id", authMiddleware, async (c) => {
  try {
    const tagId = c.req.param("id");
    
    // Check if tag exists
    const existingTag = await db.select()
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1);
    
    if (existingTag.length === 0) {
      return c.json({
        success: false,
        message: "Tag not found"
      }, 404);
    }
    
    // TODO: Check if tag is being used by products
    // For now, we'll allow deletion but in production you might want to prevent it
    
    // Delete tag
    await db.delete(tags)
      .where(eq(tags.id, tagId));
    
    return c.json({
      success: true,
      message: "Tag deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete tag error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

export default tagsRouter;