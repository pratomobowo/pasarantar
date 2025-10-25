import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '../.env' }); // Explicitly point to .env in root directory

// Function to parse DATABASE_URL
function parseDatabaseUrl(url: string) {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format. Expected: mysql://user:password@host:port/database');
  }
  const [, user, password, host, port, database] = match;
  
  // Decode URL-encoded password
  const decodedPassword = decodeURIComponent(password);
  
  return { host, port: parseInt(port), user, password: decodedPassword, database };
}

// Create MySQL connection pool
let connectionConfig;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if available
  connectionConfig = parseDatabaseUrl(process.env.DATABASE_URL);
} else {
  // Fallback to individual parameters
  connectionConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

const connection = mysql.createPool({
  ...connectionConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(connection, { schema, mode: 'default' });

// Create tables using MySQL
async function createTables() {
  try {
    // Create admins table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    
    // Create customers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        whatsapp VARCHAR(20),
        address VARCHAR(1000),
        coordinates VARCHAR(100),
        avatar_url VARCHAR(255),
        provider ENUM('email', 'google', 'facebook') DEFAULT 'email',
        provider_id VARCHAR(255),
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    
    // Create customer_social_accounts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customer_social_accounts (
        id VARCHAR(255) PRIMARY KEY,
        customer_id VARCHAR(255) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        provider_user_id VARCHAR(255) NOT NULL,
        provider_data VARCHAR(1000),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        UNIQUE KEY unique_provider_account (provider, provider_user_id)
      )
    `);
    
    // Create password_reset_tokens table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id VARCHAR(255) PRIMARY KEY,
        customer_id VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);
  
  // Create customer_addresses table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS customer_addresses (
      id VARCHAR(255) PRIMARY KEY,
      customer_id VARCHAR(255) NOT NULL,
      label VARCHAR(50) NOT NULL,
      recipient_name VARCHAR(255) NOT NULL,
      phone_number VARCHAR(20) NOT NULL,
      full_address VARCHAR(1000) NOT NULL,
      province VARCHAR(100) NOT NULL,
      city VARCHAR(100) NOT NULL,
      district VARCHAR(100) NOT NULL,
      postal_code VARCHAR(10) NOT NULL,
      coordinates VARCHAR(100),
      is_default BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )
  `);
  
  // Create categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description VARCHAR(255),
        image_url VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    
    // Create units table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS units (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        abbreviation VARCHAR(50) NOT NULL,
        description VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    
    // Create tags table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#3B82F6' NOT NULL,
        description VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    
    // Create products table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_id VARCHAR(255) NOT NULL,
        base_price FLOAT NOT NULL,
        description VARCHAR(1000) NOT NULL,
        image_url VARCHAR(255),
        default_variant_id VARCHAR(255),
        rating FLOAT DEFAULT 0 NOT NULL,
        review_count INT DEFAULT 0 NOT NULL,
        is_on_sale BOOLEAN DEFAULT FALSE NOT NULL,
        discount_percentage FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);
    
    // Create product_variants table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        unit_id VARCHAR(255) NOT NULL,
        sku VARCHAR(255) UNIQUE,
        weight VARCHAR(50) NOT NULL,
        price FLOAT NOT NULL,
        original_price FLOAT,
        in_stock BOOLEAN DEFAULT TRUE NOT NULL,
        min_order_quantity INT DEFAULT 1 NOT NULL,
        barcode VARCHAR(255),
        variant_code VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        stock_quantity INT DEFAULT 0 NOT NULL,
        manage_stock BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (unit_id) REFERENCES units(id)
      )
    `);
    
    // Create product_tags junction table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_tags (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        tag_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);
    
    // Create product_reviews table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        customer_id VARCHAR(255),
        order_id VARCHAR(255),
        customer_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL,
        comment VARCHAR(1000) NOT NULL,
        date VARCHAR(255) NOT NULL,
        verified BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    
    // Create orders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        customer_id VARCHAR(255),
        customer_name VARCHAR(255) NOT NULL,
        customer_whatsapp VARCHAR(20) NOT NULL,
        customer_address VARCHAR(1000) NOT NULL,
        customer_coordinates VARCHAR(100),
        shipping_method VARCHAR(20) NOT NULL,
        delivery_day VARCHAR(20),
        payment_method VARCHAR(20) NOT NULL,
        subtotal FLOAT NOT NULL,
        shipping_cost FLOAT NOT NULL DEFAULT 0,
        total_amount FLOAT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        notes VARCHAR(1000),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);
    
    // Create order_items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        product_variant_id VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_variant_weight VARCHAR(50) NOT NULL,
        quantity INT NOT NULL,
        unit_price FLOAT NOT NULL,
        total_price FLOAT NOT NULL,
        notes VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
      )
    `);
    
    // Create website_settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS website_settings (
        id VARCHAR(255) PRIMARY KEY,
        site_name VARCHAR(255) NOT NULL,
        site_description VARCHAR(1000),
        logo_url VARCHAR(255),
        meta_title VARCHAR(255),
        meta_description VARCHAR(500),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        contact_address VARCHAR(1000),
        business_hours VARCHAR(1000),
        social_media_links VARCHAR(1000),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create admin_notifications table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_notifications (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message VARCHAR(1000) NOT NULL,
        related_id VARCHAR(255),
        is_read BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    
    // Create customer_notifications table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customer_notifications (
        id VARCHAR(255) PRIMARY KEY,
        customer_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message VARCHAR(1000) NOT NULL,
        related_id VARCHAR(255),
        is_read BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);
  
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
}

// Check and migrate database schema if needed
async function migrateDatabase() {
  try {
    // Just create tables if they don't exist (preserve existing data)
    await createTables();
  } catch (error) {
    console.error("Error during database migration:", error);
    throw error;
  }
}

// Initialize database with seed data
export async function initializeDatabase() {
  try {
    // Check and migrate database schema if needed
    await migrateDatabase();
    
    // Create a default admin user if it doesn't exist
    const bcrypt = require("bcryptjs");
    const { nanoid } = require("nanoid");
    
    const defaultAdminId = nanoid();
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Check if admin user exists
    const [existingAdmin] = await connection.execute("SELECT * FROM admins WHERE username = ?", ["admin"]);
    
    if (!existingAdmin || (existingAdmin as Array<any>).length === 0) {
      await connection.execute(`
        INSERT INTO admins (id, username, email, password_hash, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        defaultAdminId,
        "admin",
        "admin@pasarantar.com",
        hashedPassword
      ]);
      
    }
    
    // Seed categories if none exist
    const [existingCategories] = await connection.execute("SELECT COUNT(*) as count FROM categories");
    const categoryCount = (existingCategories as Array<any>)[0].count;
    
    if (categoryCount === 0) {
      const seedCategories = [
        { id: "ayam", name: "Ayam", description: "Produk ayam segar dan olahan" },
        { id: "ikan", name: "Ikan", description: "Ikan segar dan seafood" },
        { id: "daging-sapi", name: "Daging Sapi", description: "Daging sapi segar dan olahan" },
      ];
      
      for (const category of seedCategories) {
        await connection.execute(`
          INSERT INTO categories (id, name, description, created_at, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [category.id, category.name, category.description]);
      }
      
    }
    
    // Seed units if none exist
    const [existingUnits] = await connection.execute("SELECT COUNT(*) as count FROM units");
    const unitCount = (existingUnits as Array<any>)[0].count;
    
    if (unitCount === 0) {
      const seedUnits = [
        { id: "gram", name: "Gram", abbreviation: "g" },
        { id: "kilogram", name: "Kilogram", abbreviation: "kg" },
        { id: "pcs", name: "Pieces", abbreviation: "pcs" },
      ];
      
      for (const unit of seedUnits) {
        await connection.execute(`
          INSERT INTO units (id, name, abbreviation, created_at, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [unit.id, unit.name, unit.abbreviation]);
      }
      
    }
    
    // Seed products if none exist
    const [existingProducts] = await connection.execute("SELECT COUNT(*) as count FROM products");
    const productCount = (existingProducts as Array<any>)[0].count;
    
    if (productCount === 0) {
      const seedProducts = [
        {
          id: "ayam-001",
          name: "Ayam Kampung Segar",
          category: "ayam",
          basePrice: 35000,
          description: "Ayam kampung segar berkualitas tinggi, tanpa pengawet. Dipelihara secara alami dengan pakan organik, menghasilkan daging yang lebih sehat dan bergizi. Cocok untuk berbagai masakan tradisional Indonesia.",
          imageUrl: null,
          defaultVariantId: "ayam-001-500g",
          rating: 4.5,
          reviewCount: 28,
          isOnSale: true,
          discountPercentage: 15,
        },
        {
          id: "ikan-001",
          name: "Ikan Salmon Segar",
          category: "ikan",
          basePrice: 120000,
          description: "Ikan salmon segar impor, kaya omega-3. Dipilih dari salmon terbaik yang dibekukan saat masih segar untuk menjaga kualitas nutrisi. Sangat baik untuk kesehatan jantung dan otak.",
          imageUrl: null,
          defaultVariantId: "ikan-001-500g",
          rating: 4.8,
          reviewCount: 45,
          isOnSale: true,
          discountPercentage: 25,
        },
        {
          id: "sapi-001",
          name: "Daging Sapi Has Dalam",
          category: "daging-sapi",
          basePrice: 150000,
          description: "Daging sapi has dalam premium, empuk dan juicy. Bagian pilihan dari sapi berkualitas tinggi dengan marbling yang sempurna. Ideal untuk steak, rendang, atau semur.",
          imageUrl: null,
          defaultVariantId: "sapi-001-500g",
          rating: 4.7,
          reviewCount: 52,
          isOnSale: true,
          discountPercentage: 20,
        },
      ];
      
      const seedVariants = [
        // Ayam variants
        { id: "ayam-001-250g", productId: "ayam-001", weight: "250g", price: 8500, originalPrice: 10000, inStock: true },
        { id: "ayam-001-500g", productId: "ayam-001", weight: "500g", price: 15300, originalPrice: 18000, inStock: true },
        { id: "ayam-001-1kg", productId: "ayam-001", weight: "1kg", price: 29750, originalPrice: 35000, inStock: true },
        
        // Ikan variants
        { id: "ikan-001-250g", productId: "ikan-001", weight: "250g", price: 26250, originalPrice: 35000, inStock: true },
        { id: "ikan-001-500g", productId: "ikan-001", weight: "500g", price: 48750, originalPrice: 65000, inStock: true },
        { id: "ikan-001-1kg", productId: "ikan-001", weight: "1kg", price: 90000, originalPrice: 120000, inStock: true },
        
        // Sapi variants
        { id: "sapi-001-250g", productId: "sapi-001", weight: "250g", price: 36000, originalPrice: 45000, inStock: true },
        { id: "sapi-001-500g", productId: "sapi-001", weight: "500g", price: 64000, originalPrice: 80000, inStock: true },
        { id: "sapi-001-1kg", productId: "sapi-001", weight: "1kg", price: 120000, originalPrice: 150000, inStock: true },
      ];
      
      // Insert products
      for (const product of seedProducts) {
        await connection.execute(`
          INSERT INTO products (id, name, category_id, base_price, description, image_url, default_variant_id, rating, review_count, is_on_sale, discount_percentage, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          product.id,
          product.name,
          product.category,
          product.basePrice,
          product.description,
          product.imageUrl,
          product.defaultVariantId,
          product.rating,
          product.reviewCount,
          product.isOnSale,
          product.discountPercentage
        ]);
      }
      
      // Insert variants
      for (const variant of seedVariants) {
        // Determine unit based on weight
        let unitId = "gram";
        if (variant.weight.includes("kg")) {
          unitId = "kilogram";
        } else if (variant.weight.includes("pcs")) {
          unitId = "pcs";
        }
        
        await connection.execute(`
          INSERT INTO product_variants (id, product_id, unit_id, weight, price, original_price, in_stock, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          variant.id,
          variant.productId,
          unitId,
          variant.weight,
          variant.price,
          variant.originalPrice,
          variant.inStock
        ]);
      }
      
    }
    
    // Seed website settings if none exist
    const [existingSettings] = await connection.execute("SELECT COUNT(*) as count FROM website_settings");
    const settingsCount = (existingSettings as Array<any>)[0].count;
    
    if (settingsCount === 0) {
      const { nanoid } = require("nanoid");
      const defaultSettings = {
        id: nanoid(),
        site_name: 'PasarAntar',
        site_description: 'Platform belanja online terpercaya untuk produk segar berkualitas',
        meta_title: 'PasarAntar - Belanja Produk Segar Online',
        meta_description: 'PasarAntar adalah platform belanja online terpercaya untuk daging, ikan, dan produk segar lainnya. Kualitas terjamin, pengantaran cepat.',
        business_hours: JSON.stringify({
          monday: { open: '08:00', close: '17:00', closed: false },
          tuesday: { open: '08:00', close: '17:00', closed: false },
          wednesday: { open: '08:00', close: '17:00', closed: false },
          thursday: { open: '08:00', close: '17:00', closed: false },
          friday: { open: '08:00', close: '17:00', closed: false },
          saturday: { open: '08:00', close: '15:00', closed: false },
          sunday: { open: '08:00', close: '15:00', closed: true },
        }),
        social_media_links: JSON.stringify({}),
      };

      await connection.execute(`
        INSERT INTO website_settings (
          id, site_name, site_description, meta_title, meta_description,
          business_hours, social_media_links, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        defaultSettings.id,
        defaultSettings.site_name,
        defaultSettings.site_description,
        defaultSettings.meta_title,
        defaultSettings.meta_description,
        defaultSettings.business_hours,
        defaultSettings.social_media_links,
      ]);
      
    }
    
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

export default db;