import { z } from "zod";
import { SuccessEnvelopeSchema } from "./common";
import { ProfileSchema } from "./profile";

export const LoginPayloadSchema = z.object({
  usernameOrEmail: z.string().min(1),
  password: z.string().min(1),
});

export const RegisterPayloadSchema = z
  .object({
    email: z.email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    username: z.string().min(3).max(50).optional(),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const AuthUserSchema = z.preprocess((value) => {
  if (value && typeof value === "object" && "_doc" in value) {
    return (value as { _doc: unknown })._doc;
  }
  return value;
}, ProfileSchema.extend({ lastLogin: z.string().optional() }));

export const AuthResponseSchema = z.object({
  user: AuthUserSchema,
  accessToken: z.string().min(1),
});

export const LoginResponseSchema = SuccessEnvelopeSchema(AuthResponseSchema);
export const RegisterResponseSchema = SuccessEnvelopeSchema(AuthResponseSchema);
export const MeResponseSchema = SuccessEnvelopeSchema(z.object({ user: AuthUserSchema }));
export const RefreshResponseSchema = SuccessEnvelopeSchema(
  z.object({ accessToken: z.string().min(1) })
);

export type LoginPayload = z.infer<typeof LoginPayloadSchema>;
export type RegisterPayload = z.infer<typeof RegisterPayloadSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
