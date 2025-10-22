import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { generateId } from "../utils/auth";
import { db } from "../db";
import { websiteSettings } from "../db/schema";
import { eq } from "drizzle-orm";
import type { WebsiteSettings, WebsiteSettingsUpdateRequest } from "shared/dist/types";

const settingsRouter = new Hono();

// Validation schemas
const updateSettingsSchema = z.object({
  siteName: z.string().min(1).max(255).optional(),
  siteDescription: z.string().max(1000).optional(),
  logoUrl: z.string().url().or(z.literal('')).optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
  contactEmail: z.string().email().or(z.literal('')).optional(),
  contactPhone: z.string().max(50).optional(),
  contactAddress: z.string().max(1000).optional(),
  hideSiteNameAndDescription: z.boolean().optional(),
  businessHours: z.object({
    monday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    tuesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    wednesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    thursday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    friday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    saturday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    sunday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  }).optional(),
  socialMediaLinks: z.object({
    facebook: z.string().url().or(z.literal('')).optional(),
    instagram: z.string().url().or(z.literal('')).optional(),
    twitter: z.string().url().or(z.literal('')).optional(),
    youtube: z.string().url().or(z.literal('')).optional(),
    linkedin: z.string().url().or(z.literal('')).optional(),
  }).optional(),
});

// Helper function to get or create default settings
const getOrCreateSettings = async (): Promise<WebsiteSettings> => {
  try {
    const existingSettings = await db.select().from(websiteSettings).limit(1);
    
    if (existingSettings.length > 0) {
      // Parse JSON fields from database strings to objects
      const settings = existingSettings[0];
      return {
        ...settings,
        businessHours: settings.businessHours ? JSON.parse(settings.businessHours) : undefined,
        socialMediaLinks: settings.socialMediaLinks ? JSON.parse(settings.socialMediaLinks) : undefined,
      };
    }
    
    // Create default settings if none exist
    const defaultSettings = {
      id: generateId(),
      siteName: "PasarAntar",
      siteDescription: "Platform belanja online terpercaya",
      businessHours: JSON.stringify({
        monday: { open: "08:00", close: "17:00", closed: false },
        tuesday: { open: "08:00", close: "17:00", closed: false },
        wednesday: { open: "08:00", close: "17:00", closed: false },
        thursday: { open: "08:00", close: "17:00", closed: false },
        friday: { open: "08:00", close: "17:00", closed: false },
        saturday: { open: "08:00", close: "15:00", closed: false },
        sunday: { open: "08:00", close: "15:00", closed: true },
      }),
      socialMediaLinks: JSON.stringify({}),
    };
    
    await db.insert(websiteSettings).values(defaultSettings);
    const newSettings = await db.select().from(websiteSettings).limit(1);
    
    // Parse JSON fields for the newly created settings
    const settings = newSettings[0];
    return {
      ...settings,
      businessHours: settings.businessHours ? JSON.parse(settings.businessHours) : undefined,
      socialMediaLinks: settings.socialMediaLinks ? JSON.parse(settings.socialMediaLinks) : undefined,
    };
  } catch (error) {
    console.error("Error getting/creating settings:", error);
    throw error;
  }
};

// GET /api/admin/settings - Get current website settings
settingsRouter.get("/", authMiddleware, async (c) => {
  try {
    const settings = await getOrCreateSettings();
    
    // Settings are already parsed in getOrCreateSettings
    const parsedSettings: WebsiteSettings = settings;
    
    return c.json({
      success: true,
      message: "Settings retrieved successfully",
      data: parsedSettings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return c.json({
      success: false,
      message: "Internal server error",
    }, 500);
  }
});

// PUT /api/admin/settings - Update website settings
settingsRouter.put("/", authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const updateData = updateSettingsSchema.parse(body) as WebsiteSettingsUpdateRequest;
    const existingSettings = await getOrCreateSettings();
    
    // Prepare update data
    const updateValues: any = { ...updateData };
    
    // Convert JSON fields to strings for database storage
    if (updateData.businessHours) {
      updateValues.businessHours = JSON.stringify(updateData.businessHours);
    }
    
    if (updateData.socialMediaLinks) {
      updateValues.socialMediaLinks = JSON.stringify(updateData.socialMediaLinks);
    }
    
    // Filter out empty values to avoid overwriting with empty strings
    Object.keys(updateValues).forEach(key => {
      if (updateValues[key] === '' && key !== 'siteDescription' && key !== 'metaDescription' &&
          key !== 'contactPhone' && key !== 'contactAddress') {
        delete updateValues[key];
      }
    });
    
    // Update settings
    await db
      .update(websiteSettings)
      .set(updateValues)
      .where(eq(websiteSettings.id, existingSettings.id));
    
    // Get updated settings
    const updatedSettings = await db.select().from(websiteSettings).where(eq(websiteSettings.id, existingSettings.id)).limit(1);
    
    // Parse JSON fields for response
    const dbSettings = updatedSettings[0];
    const parsedSettings: WebsiteSettings = {
      ...dbSettings,
      businessHours: dbSettings.businessHours ? JSON.parse(dbSettings.businessHours) : undefined,
      socialMediaLinks: dbSettings.socialMediaLinks ? JSON.parse(dbSettings.socialMediaLinks) : undefined,
    };
    
    return c.json({
      success: true,
      message: "Settings updated successfully",
      data: parsedSettings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    }, 500);
  }
});

export default settingsRouter;