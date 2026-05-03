/**
 * Authentication validation schemas using Zod
 */
import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().max(128),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password cannot exceed 128 characters")
    .refine(
      (pwd) => /[A-Z]/.test(pwd),
      "Password must contain at least one uppercase letter"
    )
    .refine(
      (pwd) => /[a-z]/.test(pwd),
      "Password must contain at least one lowercase letter"
    )
    .refine(
      (pwd) => /[0-9]/.test(pwd),
      "Password must contain at least one number"
    )
    .refine(
      (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      "Password must contain at least one special character"
    ),
  username: z.string().min(3, "Username must be at least 3 characters").max(50).optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
});

export const GoogleAuthRequestSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
});

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(128),
  newPassword: z
    .string()
    .min(12, "New password must be at least 12 characters")
    .max(128, "Password cannot exceed 128 characters")
    .refine(
      (pwd) => /[A-Z]/.test(pwd),
      "New password must contain at least one uppercase letter"
    )
    .refine(
      (pwd) => /[a-z]/.test(pwd),
      "New password must contain at least one lowercase letter"
    )
    .refine(
      (pwd) => /[0-9]/.test(pwd),
      "New password must contain at least one number"
    )
    .refine(
      (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      "New password must contain at least one special character"
    ),
});

export const AuthSchemas = {
  login: LoginRequestSchema,
  register: RegisterRequestSchema,
  googleAuth: GoogleAuthRequestSchema,
  changePassword: ChangePasswordRequestSchema,
};
