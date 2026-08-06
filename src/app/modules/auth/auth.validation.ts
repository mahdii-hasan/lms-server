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

const changePasswordValidationSchema = z.object({
  body: z
    .object({
      oldPassword: z
        .string()
        .min(8, "Old password must be at least 8 characters"),

      newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters"),
    })
    .refine((data) => data.oldPassword !== data.newPassword, {
      message: "New password must be different from old password",
      path: ["newPassword"],
    }),
});

const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
  }),
});
const resetPasswordValidationSchema = z.object({
  body: z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
};
