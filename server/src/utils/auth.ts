import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface AdminJWTPayload {
  adminId: string;
  username: string;
  type: 'admin';
}

export interface CustomerJWTPayload {
  customerId: string;
  email: string;
  type: 'customer';
}

export type JWTPayload = AdminJWTPayload | CustomerJWTPayload;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateAdminToken = (payload: Omit<AdminJWTPayload, 'type'>): string => {
  return jwt.sign({ ...payload, type: 'admin' }, JWT_SECRET, { expiresIn: "24h" });
};

export const generateCustomerToken = (payload: Omit<CustomerJWTPayload, 'type'>): string => {
  return jwt.sign({ ...payload, type: 'customer' }, JWT_SECRET, { expiresIn: "7d" });
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const verifyAdminToken = (token: string): AdminJWTPayload | null => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return payload.type === 'admin' ? payload : null;
  } catch (error) {
    return null;
  }
};

export const verifyCustomerToken = (token: string): CustomerJWTPayload | null => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return payload.type === 'customer' ? payload : null;
  } catch (error) {
    return null;
  }
};

export const generateId = (): string => {
  return nanoid();
};

export const generatePasswordResetToken = (): string => {
  // Generate a secure random token for password reset
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};