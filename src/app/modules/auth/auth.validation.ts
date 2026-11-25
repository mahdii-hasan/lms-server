import { z } from "zod";

const registerValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name cannot exceed 50 characters"),

    email: z.string().email("Invalid email address").toLowerCase().trim(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
  }),
});

const verifyEmailValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),

    otp: z.string().length(6, "OTP must be 6 digits"),
  }),
});

const resendVerificationValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password cannot exceed 128 characters"),
      confirmPassword: z.string().min(1, "Confirm password is required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "New password and confirm password do not match",
      path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: "New password must be different from current password",
      path: ["newPassword"],
    }),
});

const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email"),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z
    .object({
      token: z.string().min(1, "Reset token is required"),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password cannot exceed 128 characters"),
      confirmPassword: z.string().min(1, "Confirm password is required"),
    })
    .refine(
      (data) => data.newPassword === data.confirmPassword,
      {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }
    ),
});

export const AuthValidation = {
  registerValidationSchema,
  verifyEmailValidationSchema,
  resendVerificationValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
};
