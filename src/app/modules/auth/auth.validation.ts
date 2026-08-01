import { z } from "zod";

const registerValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name cannot exceed 50 characters"),

    email: z.email("Invalid email address").trim().toLowerCase(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password cannot exceed 20 characters"),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address").trim().toLowerCase(),

    password: z.string().min(1, "Password is required"),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
};
