import { Context, Next } from "hono";
import { verifyCustomerToken, CustomerJWTPayload } from "../utils/auth";

export interface CustomerAuthContext {
  customer: CustomerJWTPayload;
}

export const customerAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ 
      success: false, 
      message: "Authorization token required" 
    }, 401);
  }
  
  const token = authHeader.substring(7); // Remove "Bearer " prefix
  
  const payload = verifyCustomerToken(token);
  
  if (!payload) {
    return c.json({ 
      success: false, 
      message: "Invalid or expired token" 
    }, 401);
  }
  
  // Add customer info to context
  c.set("customer", payload);
  
  await next();
};