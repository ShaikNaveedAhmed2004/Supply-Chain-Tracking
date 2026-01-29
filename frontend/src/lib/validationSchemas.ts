import { z } from "zod";

// Auth schemas
export const registerSchema = z.object({
  name: z.string().trim().nonempty({ message: "Name is required" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(100),
  role: z.enum(["ADMIN", "SUPPLIER", "MANUFACTURER", "DISTRIBUTOR", "RETAILER", "CONSUMER"], {
    errorMap: () => ({ message: "Invalid role selected" })
  })
});

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().nonempty({ message: "Password is required" })
});

// Product schemas
export const productSchema = z.object({
  name: z.string().trim().nonempty({ message: "Product name is required" }).max(200),
  description: z.string().trim().nonempty({ message: "Description is required" }).max(1000),
  category: z.string().trim().nonempty({ message: "Category is required" }).max(100),
  sku: z.string().trim().nonempty({ message: "SKU is required" }).max(100)
});

// Batch schemas
export const batchSchema = z.object({
  productId: z.string().nonempty({ message: "Please select a product" }),
  batchNumber: z.string().trim().nonempty({ message: "Batch number is required" }).max(100),
  quantity: z.number().positive({ message: "Quantity must be greater than 0" }),
  currentLocation: z.string().trim().nonempty({ message: "Location is required" }).max(200),
  status: z.string().trim().optional()
});

export const batchStatusUpdateSchema = z.object({
  status: z.string().trim().nonempty({ message: "Status is required" }),
  currentLocation: z.string().trim().nonempty({ message: "Location is required" }).max(200)
});

// User management schemas
export const userUpdateSchema = z.object({
  role: z.enum(["ADMIN", "SUPPLIER", "MANUFACTURER", "DISTRIBUTOR", "RETAILER", "CONSUMER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional()
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type BatchFormData = z.infer<typeof batchSchema>;
export type BatchStatusUpdateFormData = z.infer<typeof batchStatusUpdateSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;

