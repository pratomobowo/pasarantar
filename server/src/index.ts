import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import type { ApiResponse } from "shared/dist";
import { initializeDatabase } from "./db";
import adminRouter from "./routes/admin";
import customersRouter from "./routes/customers";
import adminCustomersRouter from "./routes/adminCustomers";
import productsRouter from "./routes/products";
import categoriesRouter from "./routes/categories";
import unitsRouter from "./routes/units";
import tagsRouter from "./routes/tags";
import variantsRouter from "./routes/variants";
import uploadRouter from "./routes/upload";
import ordersRouter from "./routes/orders";
import reviewsRouter from "./routes/reviews";
import adminReviewsRouter from "./routes/adminReviews";
import settingsRouter from "./routes/settings";
import notificationsRouter from "./routes/notifications";
import customerNotificationsRouter from "./routes/customerNotifications";

import dotenv from 'dotenv';
dotenv.config(); // Let dotenv find the .env file automatically


// Initialize database on startup
initializeDatabase().catch(error => {
  console.error("Database initialization failed:", error);
});

export const app = new Hono()

.use(cors())


// Serve static files from uploads directory
.use("/uploads/*", serveStatic({ root: "./" }))

// Initialize database middleware (as backup)
.use(async (c, next) => {
	// Only initialize database if not already done
	// This is a fallback in case the startup initialization fails
	try {
		const db = await import("./db");
		// Check if database is already connected
		if (db.default) {
			await next();
		} else {
			await initializeDatabase();
			await next();
		}
	} catch (error) {
		console.error("Database initialization in middleware failed:", error);
		await next();
	}
})

// API routes (moved after static file serving)
.get("/api/hello", async (c) => {
	const data: ApiResponse = {
		message: "Hello BHVR!",
		success: true,
	};

	return c.json(data, { status: 200 });
})

// Admin routes
.route("/api/admin", adminRouter)

// File upload routes (admin only)
.route("/api/admin/upload", uploadRouter)

// Product management routes (admin only)
.route("/api/admin/products", productsRouter)
.route("/api/admin/categories", categoriesRouter)
.route("/api/admin/units", unitsRouter)
.route("/api/admin/tags", tagsRouter)
.route("/api/admin/variants", variantsRouter)

// Customer routes
.route("/api/customers", customersRouter)
.route("/api/admin/customers", adminCustomersRouter)

// Test route to verify admin customers path is working
.get("/api/admin/customers/test", (c) => {
  return c.json({
    success: true,
    message: "Admin customers route is working"
  });
})

// Order management routes
.route("/api/orders", ordersRouter)
.route("/api/admin/orders", ordersRouter)

// Review management routes
.route("/api/reviews", reviewsRouter)
.route("/api/admin/reviews", adminReviewsRouter)

// Settings management routes (admin only)
.route("/api/admin/settings", settingsRouter)

// Notifications management routes (admin only)
.route("/api/admin/notifications", notificationsRouter)

// Customer notifications routes
.route("/api/customer-notifications", customerNotificationsRouter)

// Public product routes (for the main app)
.get("/api/products", async (c) => {
	try {
		const { db } = await import("./db");
		const { products, productVariants, categories, units } = await import("./db/schema");
		const { eq, desc, like, or, and } = await import("drizzle-orm");
		
		const search = c.req.query("search") || "";
		
		// Build where conditions
		let whereConditions = [];
		
		if (search) {
			whereConditions.push(or(
				like(products.name, `%${search}%`),
				like(products.description, `%${search}%`),
				like(categories.name, `%${search}%`)
			));
		}
		
		const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
		
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
			.orderBy(desc(products.createdAt));
		
		const productsWithVariants = await Promise.all(
			productList.map(async (product) => {
				const variants = await db.select({
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
					stockQuantity: productVariants.stockQuantity,
					manageStock: productVariants.manageStock,
					createdAt: productVariants.createdAt,
					updatedAt: productVariants.updatedAt,
					unitName: units.name,
					unitAbbreviation: units.abbreviation,
				})
					.from(productVariants)
					.leftJoin(units, eq(productVariants.unitId, units.id))
					.where(eq(productVariants.productId, product.id))
					.orderBy(desc(productVariants.createdAt));
				
				return {
					...product,
					variants,
					isOnSale: Boolean(product.isOnSale),
					defaultVariantId: product.defaultVariantId || variants[0]?.id
				};
			})
		);
		
		return c.json({
			success: true,
			data: productsWithVariants
		});
	} catch (error) {
		console.error("Get public products error:", error);
		return c.json({
			success: false,
			message: "Internal server error"
		}, 500);
	}
})

// Public route to get a single product by ID
.get("/api/products/:id", async (c) => {
	try {
		const { db } = await import("./db");
		const { products, productVariants, categories, units } = await import("./db/schema");
		const { eq, desc } = await import("drizzle-orm");
		
		const productId = c.req.param("id");
		
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
		
		// Get variants for this product
		const variants = await db.select({
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
			stockQuantity: productVariants.stockQuantity,
			manageStock: productVariants.manageStock,
			createdAt: productVariants.createdAt,
			updatedAt: productVariants.updatedAt,
			unitName: units.name,
			unitAbbreviation: units.abbreviation,
		})
			.from(productVariants)
			.leftJoin(units, eq(productVariants.unitId, units.id))
			.where(eq(productVariants.productId, productId))
			.orderBy(desc(productVariants.createdAt));
		
		const product = {
			...productList[0],
			variants,
			isOnSale: Boolean(productList[0].isOnSale),
			defaultVariantId: productList[0].defaultVariantId || variants[0]?.id
		};
		
		return c.json({
			success: true,
			data: product
		});
	} catch (error) {
		console.error("Get public product error:", error);
		return c.json({
			success: false,
			message: "Internal server error"
		}, 500);
	}
})

// Public route to get a single product by slug
.get("/api/products/slug/:slug", async (c) => {
	try {
		const { db } = await import("./db");
		const { products, productVariants, categories, units } = await import("./db/schema");
		const { eq, desc } = await import("drizzle-orm");
		
		const productSlug = c.req.param("slug");
		
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
			.where(eq(products.slug, productSlug))
			.limit(1);
		
		if (productList.length === 0) {
			return c.json({
				success: false,
				message: "Product not found"
			}, 404);
		}
		
		// Get variants for this product
		const variants = await db.select({
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
			stockQuantity: productVariants.stockQuantity,
			manageStock: productVariants.manageStock,
			createdAt: productVariants.createdAt,
			updatedAt: productVariants.updatedAt,
			unitName: units.name,
			unitAbbreviation: units.abbreviation,
		})
			.from(productVariants)
			.leftJoin(units, eq(productVariants.unitId, units.id))
			.where(eq(productVariants.productId, productList[0].id))
			.orderBy(desc(productVariants.createdAt));
		
		const product = {
			...productList[0],
			variants,
			isOnSale: Boolean(productList[0].isOnSale),
			defaultVariantId: productList[0].defaultVariantId || variants[0]?.id
		};
		
		return c.json({
			success: true,
			data: product
		});
	} catch (error) {
		console.error("Get public product by slug error:", error);
		return c.json({
			success: false,
			message: "Internal server error"
		}, 500);
	}
})

// Public website settings endpoint
.get("/api/website-settings", async (c) => {
	try {
		const { db } = await import("./db");
		const { websiteSettings } = await import("./db/schema");
		
		const settings = await db.select().from(websiteSettings).limit(1);
		
		if (settings.length === 0) {
			return c.json({
				success: false,
				message: "Settings not found"
			}, 404);
		}
		
		// Parse JSON fields
		const parsedSettings = {
			...settings[0],
			businessHours: settings[0].businessHours ? JSON.parse(settings[0].businessHours) : undefined,
			socialMediaLinks: settings[0].socialMediaLinks ? JSON.parse(settings[0].socialMediaLinks) : undefined,
		};
		
		return c.json({
			success: true,
			data: parsedSettings
		});
	} catch (error) {
		console.error("Get public settings error:", error);
		return c.json({
			success: false,
			message: "Internal server error"
		}, 500);
	}
})

// Public categories endpoint
.get("/api/categories", async (c) => {
	try {
		const { db } = await import("./db");
		const { categories } = await import("./db/schema");
		const { eq } = await import("drizzle-orm");
		
		const categoryList = await db.select({
			id: categories.id,
			name: categories.name,
			description: categories.description,
			imageUrl: categories.imageUrl,
			isActive: categories.isActive,
		})
			.from(categories)
			.where(eq(categories.isActive, true))
			.orderBy(categories.name);
		
		// Add default icons for categories based on name
		const categoriesWithIcons = categoryList.map(category => {
			let icon = "📦"; // Default icon
			
			// Assign icons based on category name
			const name = category.name.toLowerCase();
			if (name.includes("ayam")) icon = "🐔";
			else if (name.includes("ikan")) icon = "🐟";
			else if (name.includes("sapi") || name.includes("daging")) icon = "🐄";
			else if (name.includes("marinasi") || name.includes("bumbu")) icon = "🍖";
			else if (name.includes("telur")) icon = "🥚";
			else if (name.includes("seafood")) icon = "🦐";
			else if (name.includes("olahan")) icon = "🍗";
			
			return {
				...category,
				icon
			};
		});
		
		return c.json({
			success: true,
			data: categoriesWithIcons
		});
	} catch (error) {
		console.error("Get public categories error:", error);
		return c.json({
			success: false,
			message: "Internal server error"
		}, 500);
	}
});

// Serve static files for single-origin deployment
app.use("*", serveStatic({ root: "./static" }));

// Catch-all route for SPA routing - serve index.html for all non-API routes
app.get("*", async (c, next) => {
	// Don't intercept API routes or uploads
	if (c.req.path.startsWith("/api") || c.req.path.startsWith("/uploads")) {
		return await next();
	}
	return serveStatic({ root: "./static", path: "index.html" })(c, next);
});

export default app;