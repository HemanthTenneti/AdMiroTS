import { z } from "zod";
import { PaginationSchema, SuccessEnvelopeSchema } from "./common";

export const ResolutionSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const RegisterSelfPayloadSchema = z.object({
  displayName: z.string().min(2).max(50),
  location: z.string().min(2).max(50),
  displayId: z.string().min(3).max(30).optional(),
  password: z.string().min(4).max(50).optional(),
  resolution: ResolutionSchema,
  browserInfo: z.record(z.string(), z.string()).optional(),
});

export const DisplayLoginPayloadSchema = z.object({
  displayId: z.string().min(1),
  password: z.string().min(1),
});

export const DisplayRecordSchema = z.object({
  id: z.string().optional(),
  displayId: z.string(),
  displayName: z.string(),
  location: z.string(),
  status: z.string(),
  connectionToken: z.string().optional(),
  isConnected: z.boolean().optional(),
  currentLoopId: z.string().optional(),
  lastSeen: z.string().optional(),
  resolution: ResolutionSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  assignedAdmin: z.string().nullable().optional(),
  connectionRequestStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  rejectionReason: z.string().nullable().optional(),
});

export const DisplayListResponseSchema = SuccessEnvelopeSchema(
  z.object({
    data: z.array(DisplayRecordSchema),
    pagination: PaginationSchema,
  })
);

export const RegisterSelfResponseSchema = SuccessEnvelopeSchema(
  z.object({
    displayId: z.string(),
    connectionToken: z.string(),
    status: z.string(),
    isPendingApproval: z.boolean(),
  })
);

export const DisplayLoginResponseSchema = SuccessEnvelopeSchema(
  z.object({
    displayId: z.string(),
    displayName: z.string(),
    location: z.string(),
    connectionToken: z.string(),
    resolution: ResolutionSchema.optional(),
    status: z.string(),
  })
);

export type DisplayRecord = z.infer<typeof DisplayRecordSchema>;
export type RegisterSelfPayload = z.infer<typeof RegisterSelfPayloadSchema>;
export type DisplayLoginPayload = z.infer<typeof DisplayLoginPayloadSchema>;
