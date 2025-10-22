import { Context, Next } from "hono";
import { verifyToken, JWTPayload } from "../utils/auth";

export interface AuthContext {
  admin: JWTPayload;
}

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({
      success: false,
      message: "Authorization token required"
    }, 401);
  }
  
  const token = authHeader.substring(7); // Remove "Bearer " prefix
  
  const payload = verifyToken(token);
  
  if (!payload) {
    return c.json({
      success: false,
      message: "Invalid or expired token"
    }, 401);
  }
  
  // Add admin info to context
  c.set("admin", payload);
  
  await next();
};