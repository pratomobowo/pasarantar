import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { admins } from "../db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, generateAdminToken } from "../utils/auth";
import { authMiddleware, AuthContext } from "../middleware/auth";

const adminRouter = new Hono();

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/admin/login - Admin login
adminRouter.post("/login", async (c) => {
  try {
    const data = await c.req.json();
    const { username, password } = loginSchema.parse(data);
    
    // Find admin user
    const admin = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
    
    if (admin.length === 0) {
      return c.json({
        success: false,
        message: "Invalid username or password"
      }, 401);
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, admin[0].passwordHash);
    
    if (!isValidPassword) {
      return c.json({
        success: false,
        message: "Invalid username or password"
      }, 401);
    }
    
    // Generate JWT token
    const token = generateAdminToken({
      adminId: admin[0].id,
      username: admin[0].username
    });
    
    return c.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        admin: {
          id: admin[0].id,
          username: admin[0].username,
          email: admin[0].email
        }
      }
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/admin/me - Get current admin info (protected)
adminRouter.get("/me", authMiddleware, async (c) => {
  try {
    const admin = (c as any).get("admin") as { adminId: string; username: string };
    
    // Get full admin info from database
    const adminInfo = await db.select({
      id: admins.id,
      username: admins.username,
      email: admins.email,
      createdAt: admins.createdAt
    }).from(admins).where(eq(admins.id, admin.adminId)).limit(1);
    
    if (adminInfo.length === 0) {
      return c.json({
        success: false,
        message: "Admin not found"
      }, 404);
    }
    
    return c.json({
      success: true,
      data: adminInfo[0]
    });
    
  } catch (error) {
    console.error("Get admin info error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// POST /api/admin/logout - Admin logout (client-side token removal)
adminRouter.post("/logout", authMiddleware, async (c) => {
  return c.json({
    success: true,
    message: "Logout successful"
  });
});

export default adminRouter;