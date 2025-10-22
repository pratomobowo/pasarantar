import { Hono } from "hono";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { authMiddleware } from "../middleware/auth";
import { generateId } from "../utils/auth";

const uploadRouter = new Hono();

// Create uploads directory if it doesn't exist
const ensureUploadsDir = async () => {
  try {
    await mkdir(join(process.cwd(), "uploads"), { recursive: true });
  } catch (error) {
    // Directory already exists or other error
    console.log("Uploads directory check:", error);
  }
};

// POST /api/admin/upload - Upload image file
uploadRouter.post("/", authMiddleware, async (c) => {
  try {
    await ensureUploadsDir();
    
    const body = await c.req.parseBody();
    const file = body.image as File;
    
    if (!file) {
      return c.json({
        success: false,
        message: "No file provided"
      }, 400);
    }
    
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
      }, 400);
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return c.json({
        success: false,
        message: "File too large. Maximum size is 5MB."
      }, 400);
    }
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filename = `${generateId()}.${fileExtension}`;
    const filePath = join(process.cwd(), "uploads", filename);
    
    // Write file to disk
    const buffer = await file.arrayBuffer();
    await writeFile(filePath, new Uint8Array(buffer));
    
    // Return the URL that can be used to access the file
    const imageUrl = `/uploads/${filename}`;
    
    return c.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        filename,
        url: imageUrl
      }
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

export default uploadRouter;