import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(8, "Password should be at least 8 characters").min(1, "Password is required"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});