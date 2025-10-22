import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { products, productVariants, categories, units as unitsTable, tags, productTags } from "../db/schema";
import { eq, and, desc, like, or, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { generateId } from "../utils/auth";

// Function to generate slug from product name
const generateSlug = (productName: string): string => {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

// Function to generate SKU automatically
const generateSKU = (productName: string, weight: string, unitAbbreviation?: string, timestamp?: number): string => {
  // Clean product name: remove special characters, convert to uppercase
  const cleanName = productName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
  
  // Take first 3 letters from product name (or less if name is shorter)
  const nameCode = cleanName.substring(0, 3);
  
  // Clean weight: remove non-alphanumeric characters
  const cleanWeight = weight.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Get unit abbreviation or use default
  const unit = unitAbbreviation || 'PCS';
  
  // Use timestamp to ensure uniqueness
  const now = timestamp || Date.now();
  const uniqueSuffix = now.toString(36).toUpperCase().slice(-4); // Last 4 chars of timestamp in base36
  
  return `${nameCode}-${cleanWeight}${unit}-${uniqueSuffix}`;
};

const productsRouter = new Hono();

// Product schemas
const productVariantSchema = z.object({
  id: z.string().optional(),
  unitId: z.string().min(1, "Unit is required"),
  sku: z.string().optional(),
  weight: z.string().min(1, "Weight is required"),
  price: z.number().min(0, "Price must be positive"),
  originalPrice: z.number().optional(),
  inStock: z.boolean().default(true),
  minOrderQuantity: z.number().min(1).default(1), // Keep for backward compatibility but set default
  barcode: z.string().optional(),
  variantCode: z.string().optional(),
  isActive: z.boolean().default(true),
});

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  basePrice: z.number().min(0, "Base price must be positive"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional().nullable(),
  defaultVariantId: z.string().optional(),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().min(0).default(0),
  isOnSale: z.boolean().default(false),
  discountPercentage: z.number().min(0).max(100).optional(),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
  tagIds: z.array(z.string()).optional(),
});

// GET /api/admin/products - Get all products with variants
productsRouter.get("/", authMiddleware, async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const search = c.req.query("search") || "";
    const category = c.req.query("category") || "";
    
    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(or(
        like(products.name, `%${search}%`),
        like(products.description, `%${search}%`)
      ));
    }
    
    if (category) {
      whereConditions.push(eq(products.categoryId, category));
    }
    
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    // Get products with categories
    const productList = await db.select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      categoryId: products.categoryId,
      basePrice: products.basePrice,
      description: products.description,
      imageUrl: products.imageUrl,
      defaultVariantId: products.defaultVariantId,
      rating: products.rating,
      reviewCount: products.reviewCount,
      isOnSale: products.isOnSale,
      discountPercentage: products.discountPercentage,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryName: categories.name,
    })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get variants for each product
    const productsWithVariants = await Promise.all(
      productList.map(async (product) => {
        const variants = await db.select()
          .from(productVariants)
          .where(eq(productVariants.productId, product.id))
          .orderBy(desc(productVariants.createdAt));
        
        return {
          ...product,
          variants
        };
      })
    );
    
    // Get total count
    const totalCount = await db.select({ count: sql<number>`count(*)`.as('count') })
      .from(products)
      .where(whereClause);
    
    return c.json({
      success: true,
      data: {
        products: productsWithVariants,
        pagination: {
          page,
          limit,
          total: totalCount.length,
          totalPages: Math.ceil(totalCount.length / limit)
        }
      }
    });
    
  } catch (error) {
    console.error("Get products error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/admin/products/:id - Get single product with variants
productsRouter.get("/:id", authMiddleware, async (c) => {
  try {
    const productId = c.req.param("id");
    
    // Get product with category
    const productList = await db.select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      categoryId: products.categoryId,
      basePrice: products.basePrice,
      description: products.description,
      imageUrl: products.imageUrl,
      defaultVariantId: products.defaultVariantId,
      rating: products.rating,
      reviewCount: products.reviewCount,
      isOnSale: products.isOnSale,
      discountPercentage: products.discountPercentage,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryName: categories.name,
    })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, productId))
      .limit(1);
    
    if (productList.length === 0) {
      return c.json({
        success: false,
        message: "Product not found"
      }, 404);
    }
    
    // Get variants
    const variants = await db.select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId))
      .orderBy(desc(productVariants.createdAt));
    
    // Get product tags
    const productTagsList = await db.select({
      id: productTags.id,
      productId: productTags.productId,
      tagId: productTags.tagId,
      tagName: tags.name,
      tagColor: tags.color,
    })
      .from(productTags)
      .leftJoin(tags, eq(productTags.tagId, tags.id))
      .where(eq(productTags.productId, productId));
    
    // Extract tag IDs for the response
    const tagIds = productTagsList.map(pt => pt.tagId).filter(Boolean);
    
    return c.json({
      success: true,
      data: {
        ...productList[0],
        variants,
        tagIds
      }
    });
    
  } catch (error) {
    console.error("Get product error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// POST /api/admin/products - Create new product
productsRouter.post("/", authMiddleware, async (c) => {
  try {
    const data = await c.req.json();
    const validatedData = productSchema.parse(data);
    const productId = generateId();
    
    // Generate slug if not provided
    const slug = validatedData.slug || generateSlug(validatedData.name);
    
    // Create product
    const newProduct = {
      id: productId,
      name: validatedData.name,
      slug: slug,
      categoryId: validatedData.categoryId,
      basePrice: validatedData.basePrice,
      description: validatedData.description,
      imageUrl: validatedData.imageUrl,
      defaultVariantId: validatedData.variants[0].id || generateId(), // Use first variant as default
      rating: validatedData.rating,
      reviewCount: validatedData.reviewCount,
      isOnSale: validatedData.isOnSale,
      discountPercentage: validatedData.discountPercentage,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(products).values(newProduct);
    
    // Get all units for SKU generation
    const allUnits = await db.select().from(unitsTable);
    
    // Create variants
    const variantsToInsert = validatedData.variants.map(variant => {
      // Always generate SKU for new variants
      const unit = allUnits.find(u => u.id === variant.unitId);
      const sku = generateSKU(validatedData.name, variant.weight, unit?.abbreviation);
      
      return {
        id: variant.id || generateId(),
        productId: productId,
        unitId: variant.unitId,
        sku: sku, // Always include generated SKU
        weight: variant.weight,
        price: variant.price,
        originalPrice: variant.originalPrice,
        inStock: variant.inStock,
        minOrderQuantity: variant.minOrderQuantity || 1, // Default to 1 if not provided
        barcode: variant.barcode || null, // Default to null if not provided
        variantCode: variant.variantCode || null, // Default to null if not provided
        isActive: variant.isActive !== false, // Default to true if not provided
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });
    
    await db.insert(productVariants).values(variantsToInsert);
    
    return c.json({
      success: true,
      message: "Product created successfully",
      data: {
        id: productId,
        ...newProduct,
        variants: variantsToInsert
      }
    });
    
  } catch (error) {
    console.error("Create product error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PUT /api/admin/products/:id - Update product
productsRouter.put("/:id", authMiddleware, async (c) => {
  try {
    const productId = c.req.param("id");
    console.log(`Backend: Updating product with ID: ${productId}`);
    
    const data = await c.req.json();
    console.log(`Backend: Received data:`, data);
    
    console.log(`Backend: About to validate data with schema`);
    const validatedData = productSchema.parse(data);
    console.log(`Backend: Validated data:`, validatedData);
    
    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    
    if (existingProduct.length === 0) {
      return c.json({
        success: false,
        message: "Product not found"
      }, 404);
    }
    
    // Import orderItems to handle foreign key constraints
    const { orderItems } = await import("../db/schema");
    
    // Get existing variants for this product
    const existingVariants = await db.select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId));
    
    // Get IDs of variants in the updated data
    const updatedVariantIds = validatedData.variants.map(variant => variant.id).filter(Boolean);
    
    // Find variants that will be removed (exist in DB but not in updated data)
    const variantsToDelete = existingVariants.filter(
      variant => !updatedVariantIds.includes(variant.id)
    );
    
    // Delete order items for variants that will be removed
    if (variantsToDelete.length > 0) {
      const variantIdsToDelete = variantsToDelete.map(variant => variant.id);
      await db.delete(orderItems)
        .where(sql`product_variant_id IN ${variantIdsToDelete}`);
    }
    
    // Delete variants that will be removed
    if (variantsToDelete.length > 0) {
      const variantIdsToDelete = variantsToDelete.map(variant => variant.id);
      await db.delete(productVariants)
        .where(sql`id IN ${variantIdsToDelete}`);
    }
    
    // Generate slug if not provided or if name changed
    const generateNewSlug = !validatedData.slug || existingProduct[0].name !== validatedData.name;
    const slug = generateNewSlug ? generateSlug(validatedData.name) : validatedData.slug;
    
    // Update product
    const updatedProduct = {
      name: validatedData.name,
      slug: slug,
      categoryId: validatedData.categoryId,
      basePrice: validatedData.basePrice,
      description: validatedData.description,
      imageUrl: validatedData.imageUrl,
      defaultVariantId: validatedData.defaultVariantId || validatedData.variants[0].id,
      rating: validatedData.rating,
      reviewCount: validatedData.reviewCount,
      isOnSale: validatedData.isOnSale,
      discountPercentage: validatedData.discountPercentage,
      updatedAt: new Date(),
    };
    
    await db.update(products)
      .set(updatedProduct)
      .where(eq(products.id, productId));
    
    // Get all units for SKU generation
    const allUnits = await db.select().from(unitsTable);
    
    // Update or insert variants
    const variantsToUpsert = validatedData.variants.map(variant => {
      // Always generate SKU for new variants
      let sku = variant.sku;
      if (!variant.id) { // Only generate SKU for new variants
        const unit = allUnits.find(u => u.id === variant.unitId);
        sku = generateSKU(validatedData.name, variant.weight, unit?.abbreviation);
      }
      
      return {
        id: variant.id || generateId(),
        productId: productId,
        unitId: variant.unitId,
        sku: sku || null,
        weight: variant.weight,
        price: variant.price,
        originalPrice: variant.originalPrice,
        inStock: variant.inStock,
        minOrderQuantity: variant.minOrderQuantity || 1, // Default to 1 if not provided
        barcode: variant.barcode || null, // Default to null if not provided
        variantCode: variant.variantCode || null, // Default to null if not provided
        isActive: variant.isActive !== false, // Default to true if not provided
        createdAt: variant.id ? undefined : new Date(), // Only set createdAt for new variants
        updatedAt: new Date(),
      };
    });
    
    // Process each variant - update if exists, insert if new
    for (const variant of variantsToUpsert) {
      // Check if this variant already exists in the database
      const existingVariant = existingVariants.find(v => v.id === variant.id);
      
      if (existingVariant) {
        // Update existing variant
        await db.update(productVariants)
          .set({
            unitId: variant.unitId,
            sku: variant.sku,
            weight: variant.weight,
            price: variant.price,
            originalPrice: variant.originalPrice,
            inStock: variant.inStock,
            minOrderQuantity: variant.minOrderQuantity,
            barcode: variant.barcode,
            variantCode: variant.variantCode,
            isActive: variant.isActive,
            updatedAt: variant.updatedAt,
          })
          .where(eq(productVariants.id, variant.id));
      } else {
        // Insert new variant
        await db.insert(productVariants).values(variant);
      }
    }
    
    // Update product tags
    // Delete existing product tags
    await db.delete(productTags)
      .where(eq(productTags.productId, productId));
    
    // Insert new product tags
    if (validatedData.tagIds && validatedData.tagIds.length > 0) {
      const productTagsToInsert = validatedData.tagIds.map(tagId => ({
        id: generateId(),
        productId,
        tagId,
      }));
      
      await db.insert(productTags).values(productTagsToInsert);
    }
    
    // Get updated variants for response
    const updatedVariants = await db.select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId));
    
    const responseData = {
      success: true,
      message: "Product updated successfully",
      data: {
        id: productId,
        ...updatedProduct,
        variants: updatedVariants
      }
    };
    
    console.log(`Backend: Sending response:`, responseData);
    return c.json(responseData);
    
  } catch (error) {
    console.error("Backend: Update product error:", error);
    console.error("Backend: Error details:", error instanceof Error ? error.message : String(error));
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error"
    }, 500);
  }
});

// DELETE /api/admin/products/:id - Delete product
productsRouter.delete("/:id", authMiddleware, async (c) => {
  try {
    const productId = c.req.param("id");
    
    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    
    if (existingProduct.length === 0) {
      return c.json({
        success: false,
        message: "Product not found"
      }, 404);
    }
    
    // Import orderItems to handle foreign key constraints
    const { orderItems } = await import("../db/schema");
    
    // Get all product variants for this product
    const productVariantsList = await db.select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId));
    
    // Delete order items that reference these product variants
    if (productVariantsList.length > 0) {
      const variantIds = productVariantsList.map(variant => variant.id);
      await db.delete(orderItems)
        .where(sql`product_variant_id IN ${variantIds}`);
    }
    
    // Delete product variants
    await db.delete(productVariants)
      .where(eq(productVariants.productId, productId));
    
    // Delete product tags
    await db.delete(productTags)
      .where(eq(productTags.productId, productId));
    
    // Delete product
    await db.delete(products)
      .where(eq(products.id, productId));
    
    return c.json({
      success: true,
      message: "Product deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete product error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

export default productsRouter;