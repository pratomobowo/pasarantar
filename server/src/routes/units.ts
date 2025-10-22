import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { units } from "../db/schema";
import { eq, desc, like } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { generateId } from "../utils/auth";

const unitsRouter = new Hono();

// Unit schema
const unitSchema = z.object({
  name: z.string().min(1, "Unit name is required"),
  abbreviation: z.string().min(1, "Abbreviation is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET /api/admin/units - Get all units
unitsRouter.get("/", authMiddleware, async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const search = c.req.query("search") || "";
    
    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(like(units.name, `%${search}%`));
    }
    
    const whereClause = whereConditions.length > 0 ? 
      whereConditions.reduce((acc, condition) => acc && condition) : undefined;
    
    // Get units
    const unitList = await db.select()
      .from(units)
      .where(whereClause)
      .orderBy(desc(units.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get total count
    const totalCount = await db.select({ count: units.id })
      .from(units)
      .where(whereClause);
    
    return c.json({
      success: true,
      data: {
        units: unitList,
        pagination: {
          page,
          limit,
          total: totalCount.length,
          totalPages: Math.ceil(totalCount.length / limit)
        }
      }
    });
    
  } catch (error) {
    console.error("Get units error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/admin/units/:id - Get single unit
unitsRouter.get("/:id", authMiddleware, async (c) => {
  try {
    const unitId = c.req.param("id");
    
    const unitList = await db.select()
      .from(units)
      .where(eq(units.id, unitId))
      .limit(1);
    
    if (unitList.length === 0) {
      return c.json({
        success: false,
        message: "Unit not found"
      }, 404);
    }
    
    return c.json({
      success: true,
      data: unitList[0]
    });
    
  } catch (error) {
    console.error("Get unit error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/admin/units/active - Get active units (for dropdowns)
unitsRouter.get("/active/list", authMiddleware, async (c) => {
  try {
    const activeUnits = await db.select()
      .from(units)
      .where(eq(units.isActive, true))
      .orderBy(units.name);
    
    return c.json({
      success: true,
      data: activeUnits
    });
    
  } catch (error) {
    console.error("Get active units error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// POST /api/admin/units - Create new unit
unitsRouter.post("/", authMiddleware, async (c) => {
  try {
    const data = await c.req.json();
    const validatedData = unitSchema.parse(data);
    const unitId = generateId();
    
    // Check if unit name already exists
    const existingUnit = await db.select()
      .from(units)
      .where(eq(units.name, validatedData.name))
      .limit(1);
    
    if (existingUnit.length > 0) {
      return c.json({
        success: false,
        message: "Unit name already exists"
      }, 400);
    }
    
    // Check if abbreviation already exists
    const existingAbbreviation = await db.select()
      .from(units)
      .where(eq(units.abbreviation, validatedData.abbreviation))
      .limit(1);
    
    if (existingAbbreviation.length > 0) {
      return c.json({
        success: false,
        message: "Abbreviation already exists"
      }, 400);
    }
    
    // Create unit
    const newUnit = {
      id: unitId,
      name: validatedData.name,
      abbreviation: validatedData.abbreviation,
      description: validatedData.description,
      isActive: validatedData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(units).values(newUnit);
    
    return c.json({
      success: true,
      message: "Unit created successfully",
      data: newUnit
    });
    
  } catch (error) {
    console.error("Create unit error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PUT /api/admin/units/:id - Update unit
unitsRouter.put("/:id", authMiddleware, async (c) => {
  try {
    const unitId = c.req.param("id");
    const data = await c.req.json();
    const validatedData = unitSchema.parse(data);
    
    // Check if unit exists
    const existingUnit = await db.select()
      .from(units)
      .where(eq(units.id, unitId))
      .limit(1);
    
    if (existingUnit.length === 0) {
      return c.json({
        success: false,
        message: "Unit not found"
      }, 404);
    }
    
    // Check if unit name already exists (excluding current unit)
    const duplicateUnit = await db.select()
      .from(units)
      .where(eq(units.name, validatedData.name))
      .limit(1);
    
    if (duplicateUnit.length > 0 && duplicateUnit[0].id !== unitId) {
      return c.json({
        success: false,
        message: "Unit name already exists"
      }, 400);
    }
    
    // Check if abbreviation already exists (excluding current unit)
    const duplicateAbbreviation = await db.select()
      .from(units)
      .where(eq(units.abbreviation, validatedData.abbreviation))
      .limit(1);
    
    if (duplicateAbbreviation.length > 0 && duplicateAbbreviation[0].id !== unitId) {
      return c.json({
        success: false,
        message: "Abbreviation already exists"
      }, 400);
    }
    
    // Update unit
    const updatedUnit = {
      name: validatedData.name,
      abbreviation: validatedData.abbreviation,
      description: validatedData.description,
      isActive: validatedData.isActive,
      updatedAt: new Date(),
    };
    
    await db.update(units)
      .set(updatedUnit)
      .where(eq(units.id, unitId));
    
    return c.json({
      success: true,
      message: "Unit updated successfully",
      data: {
        id: unitId,
        ...updatedUnit
      }
    });
    
  } catch (error) {
    console.error("Update unit error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// DELETE /api/admin/units/:id - Delete unit
unitsRouter.delete("/:id", authMiddleware, async (c) => {
  try {
    const unitId = c.req.param("id");
    
    // Check if unit exists
    const existingUnit = await db.select()
      .from(units)
      .where(eq(units.id, unitId))
      .limit(1);
    
    if (existingUnit.length === 0) {
      return c.json({
        success: false,
        message: "Unit not found"
      }, 404);
    }
    
    // TODO: Check if unit is being used by product variants
    // For now, we'll allow deletion but in production you might want to prevent it
    
    // Delete unit
    await db.delete(units)
      .where(eq(units.id, unitId));
    
    return c.json({
      success: true,
      message: "Unit deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete unit error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

export default unitsRouter;