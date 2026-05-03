import client from "./client";
import { z } from "zod";
import {
  AuthResponse,
  LoginPayload,
  LoginPayloadSchema,
  LoginResponseSchema,
  MeResponseSchema,
  RefreshResponseSchema,
  RegisterPayload,
  RegisterPayloadSchema,
  RegisterResponseSchema,
} from "@/lib/contracts";

export type { LoginPayload, RegisterPayload, AuthResponse };

const GoogleLoginPayloadSchema = z.object({
  token: z.string().min(1),
});

export const authApi = {
  login: async (payload: LoginPayload) => {
    const parsedPayload = LoginPayloadSchema.parse(payload);
    const response = await client.post("/api/auth/login", parsedPayload);
    const parsedResponse = LoginResponseSchema.parse(response.data);
    return { ...response, data: parsedResponse };
  },

  register: async (payload: RegisterPayload) => {
    const parsedPayload = RegisterPayloadSchema.parse(payload);
    const response = await client.post("/api/auth/register", parsedPayload);
    const parsedResponse = RegisterResponseSchema.parse(response.data);
    return { ...response, data: parsedResponse };
  },

  google: async (token: string) => {
    const parsedPayload = GoogleLoginPayloadSchema.parse({ token });
    const response = await client.post("/api/auth/google", parsedPayload);
    const parsedResponse = LoginResponseSchema.parse(response.data);
    return { ...response, data: parsedResponse };
  },

  me: async () => {
    const response = await client.get("/api/auth/me");
    const parsedResponse = MeResponseSchema.parse(response.data);
    return { ...response, data: parsedResponse };
  },

  refresh: async () => {
    const response = await client.post("/api/auth/refresh");
    const parsedResponse = RefreshResponseSchema.parse(response.data);
    return { ...response, data: parsedResponse };
  },

  logout: () => client.post("/api/auth/logout"),
};
