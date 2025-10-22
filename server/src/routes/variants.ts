import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { productVariants, products, units } from "../db/schema";
import { eq, desc, like, and, or } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { generateId } from "../utils/auth";

const variantsRouter = new Hono();

// Product variant schema
const variantSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  unitId: z.string().min(1, "Unit ID is required"),
  sku: z.string().optional(),
  weight: z.string().min(1, "Weight is required"),
  price: z.number().min(0, "Price must be positive"),
  originalPrice: z.number().optional(),
  inStock: z.boolean().default(true),
  minOrderQuantity: z.number().min(1).default(1),
  barcode: z.string().optional(),
  variantCode: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET /api/admin/variants - Get all variants
variantsRouter.get("/", authMiddleware, async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const search = c.req.query("search") || "";
    const productId = c.req.query("productId") || "";
    const unitId = c.req.query("unitId") || "";
    
    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(or(
        like(productVariants.sku, `%${search}%`),
        like(productVariants.weight, `%${search}%`),
        like(productVariants.barcode, `%${search}%`),
        like(productVariants.variantCode, `%${search}%`)
      ));
    }
    
    if (productId) {
      whereConditions.push(eq(productVariants.productId, productId));
    }
    
    if (unitId) {
      whereConditions.push(eq(productVariants.unitId, unitId));
    }
    
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    // Get variants with related data
    const variantList = await db.select({
      id: productVariants.id,
      productId: productVariants.productId,
      unitId: productVariants.unitId,
      sku: productVariants.sku,
      weight: productVariants.weight,
      price: productVariants.price,
      originalPrice: productVariants.originalPrice,
      inStock: productVariants.inStock,
      minOrderQuantity: productVariants.minOrderQuantity,
      barcode: productVariants.barcode,
      variantCode: productVariants.variantCode,
      isActive: productVariants.isActive,
      createdAt: productVariants.createdAt,
      updatedAt: productVariants.updatedAt,
      productName: products.name,
      unitName: units.name,
      unitAbbreviation: units.abbreviation,
    })
      .from(productVariants)
      .leftJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(units, eq(productVariants.unitId, units.id))
      .where(whereClause)
      .orderBy(desc(productVariants.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get total count
    const totalCount = await db.select({ count: productVariants.id })
      .from(productVariants)
      .where(whereClause);
    
    return c.json({
      success: true,
      data: {
        variants: variantList,
        pagination: {
          page,
          limit,
          total: totalCount.length,
          totalPages: Math.ceil(totalCount.length / limit)
        }
      }
    });
    
  } catch (error) {
    console.error("Get variants error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/admin/variants/:id - Get single variant
variantsRouter.get("/:id", authMiddleware, async (c) => {
  try {
    const variantId = c.req.param("id");
    
    const variantList = await db.select({
      id: productVariants.id,
      productId: productVariants.productId,
      unitId: productVariants.unitId,
      sku: productVariants.sku,
      weight: productVariants.weight,
      price: productVariants.price,
      originalPrice: productVariants.originalPrice,
      inStock: productVariants.inStock,
      minOrderQuantity: productVariants.minOrderQuantity,
      barcode: productVariants.barcode,
      variantCode: productVariants.variantCode,
      isActive: productVariants.isActive,
      createdAt: productVariants.createdAt,
      updatedAt: productVariants.updatedAt,
      productName: products.name,
      unitName: units.name,
      unitAbbreviation: units.abbreviation,
    })
      .from(productVariants)
      .leftJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(units, eq(productVariants.unitId, units.id))
      .where(eq(productVariants.id, variantId))
      .limit(1);
    
    if (variantList.length === 0) {
      return c.json({
        success: false,
        message: "Variant not found"
      }, 404);
    }
    
    return c.json({
      success: true,
      data: variantList[0]
    });
    
  } catch (error) {
    console.error("Get variant error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/admin/variants/product/:productId - Get variants for specific product
variantsRouter.get("/product/:productId", authMiddleware, async (c) => {
  try {
    const productId = c.req.param("productId");
    
    const variantList = await db.select({
      id: productVariants.id,
      productId: productVariants.productId,
      unitId: productVariants.unitId,
      sku: productVariants.sku,
      weight: productVariants.weight,
      price: productVariants.price,
      originalPrice: productVariants.originalPrice,
      inStock: productVariants.inStock,
      minOrderQuantity: productVariants.minOrderQuantity,
      barcode: productVariants.barcode,
      variantCode: productVariants.variantCode,
      isActive: productVariants.isActive,
      createdAt: productVariants.createdAt,
      updatedAt: productVariants.updatedAt,
      unitName: units.name,
      unitAbbreviation: units.abbreviation,
    })
      .from(productVariants)
      .leftJoin(units, eq(productVariants.unitId, units.id))
      .where(and(
        eq(productVariants.productId, productId),
        eq(productVariants.isActive, true)
      ))
      .orderBy(productVariants.createdAt);
    
    return c.json({
      success: true,
      data: variantList
    });
    
  } catch (error) {
    console.error("Get product variants error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// POST /api/admin/variants - Create new variant
variantsRouter.post("/", authMiddleware, async (c) => {
  try {
    const data = await c.req.json();
    const validatedData = variantSchema.parse(data);
    const variantId = generateId();
    
    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, validatedData.productId))
      .limit(1);
    
    if (existingProduct.length === 0) {
      return c.json({
        success: false,
        message: "Product not found"
      }, 404);
    }
    
    // Check if unit exists
    const existingUnit = await db.select()
      .from(units)
      .where(eq(units.id, validatedData.unitId))
      .limit(1);
    
    if (existingUnit.length === 0) {
      return c.json({
        success: false,
        message: "Unit not found"
      }, 404);
    }
    
    // Check if SKU already exists (if provided)
    if (validatedData.sku) {
      const existingSku = await db.select()
        .from(productVariants)
        .where(eq(productVariants.sku, validatedData.sku))
        .limit(1);
      
      if (existingSku.length > 0) {
        return c.json({
          success: false,
          message: "SKU already exists"
        }, 400);
      }
    }
    
    // Create variant
    const newVariant = {
      id: variantId,
      productId: validatedData.productId,
      unitId: validatedData.unitId,
      sku: validatedData.sku,
      weight: validatedData.weight,
      price: validatedData.price,
      originalPrice: validatedData.originalPrice,
      inStock: validatedData.inStock,
      minOrderQuantity: validatedData.minOrderQuantity,
      barcode: validatedData.barcode,
      variantCode: validatedData.variantCode,
      isActive: validatedData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(productVariants).values(newVariant);
    
    return c.json({
      success: true,
      message: "Variant created successfully",
      data: newVariant
    });
    
  } catch (error) {
    console.error("Create variant error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PUT /api/admin/variants/:id - Update variant
variantsRouter.put("/:id", authMiddleware, async (c) => {
  try {
    const variantId = c.req.param("id");
    const data = await c.req.json();
    const validatedData = variantSchema.parse(data);
    
    // Check if variant exists
    const existingVariant = await db.select()
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);
    
    if (existingVariant.length === 0) {
      return c.json({
        success: false,
        message: "Variant not found"
      }, 404);
    }
    
    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, validatedData.productId))
      .limit(1);
    
    if (existingProduct.length === 0) {
      return c.json({
        success: false,
        message: "Product not found"
      }, 404);
    }
    
    // Check if unit exists
    const existingUnit = await db.select()
      .from(units)
      .where(eq(units.id, validatedData.unitId))
      .limit(1);
    
    if (existingUnit.length === 0) {
      return c.json({
        success: false,
        message: "Unit not found"
      }, 404);
    }
    
    // Check if SKU already exists (if provided and different from current)
    if (validatedData.sku && validatedData.sku !== existingVariant[0].sku) {
      const existingSku = await db.select()
        .from(productVariants)
        .where(eq(productVariants.sku, validatedData.sku))
        .limit(1);
      
      if (existingSku.length > 0) {
        return c.json({
          success: false,
          message: "SKU already exists"
        }, 400);
      }
    }
    
    // Update variant
    const updatedVariant = {
      productId: validatedData.productId,
      unitId: validatedData.unitId,
      sku: validatedData.sku,
      weight: validatedData.weight,
      price: validatedData.price,
      originalPrice: validatedData.originalPrice,
      inStock: validatedData.inStock,
      minOrderQuantity: validatedData.minOrderQuantity,
      barcode: validatedData.barcode,
      variantCode: validatedData.variantCode,
      isActive: validatedData.isActive,
      updatedAt: new Date(),
    };
    
    await db.update(productVariants)
      .set(updatedVariant)
      .where(eq(productVariants.id, variantId));
    
    return c.json({
      success: true,
      message: "Variant updated successfully",
      data: {
        id: variantId,
        ...updatedVariant
      }
    });
    
  } catch (error) {
    console.error("Update variant error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PUT /api/admin/variants/:id/stock - Update variant stock
variantsRouter.put("/:id/stock", authMiddleware, async (c) => {
  try {
    const variantId = c.req.param("id");
    const data = await c.req.json();
    const { inStock } = z.object({
      inStock: z.boolean()
    }).parse(data);
    
    // Check if variant exists
    const existingVariant = await db.select()
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);
    
    if (existingVariant.length === 0) {
      return c.json({
        success: false,
        message: "Variant not found"
      }, 404);
    }
    
    // Update stock
    await db.update(productVariants)
      .set({ 
        inStock,
        updatedAt: new Date()
      })
      .where(eq(productVariants.id, variantId));
    
    return c.json({
      success: true,
      message: "Stock updated successfully",
      data: {
        id: variantId,
        inStock
      }
    });
    
  } catch (error) {
    console.error("Update stock error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// DELETE /api/admin/variants/:id - Delete variant
variantsRouter.delete("/:id", authMiddleware, async (c) => {
  try {
    const variantId = c.req.param("id");
    
    // Check if variant exists
    const existingVariant = await db.select()
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);
    
    if (existingVariant.length === 0) {
      return c.json({
        success: false,
        message: "Variant not found"
      }, 404);
    }
    
    // Delete variant
    await db.delete(productVariants)
      .where(eq(productVariants.id, variantId));
    
    return c.json({
      success: true,
      message: "Variant deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete variant error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

export default variantsRouter;