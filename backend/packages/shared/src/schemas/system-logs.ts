import { z } from "zod";
import { PaginationSchema, SuccessEnvelopeSchema } from "./common";

export const SystemLogRecordSchema = z
  .object({
    id: z.string(),
    action: z.string(),
    entityType: z.string(),
    entityId: z.string(),
    userId: z.string().optional(),
    description: z.string().optional(),
    details: z
      .object({
        description: z.string(),
        changes: z.record(z.string(), z.any()).optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
      .optional(),
    changes: z.record(z.string(), z.any()).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .transform((value) => ({
    ...value,
    description: value.description ?? value.details?.description ?? "",
    changes: value.changes ?? value.details?.changes,
    metadata: value.metadata ?? value.details?.metadata,
  }));

export const SystemLogListResponseSchema = SuccessEnvelopeSchema(
  z.object({
    data: z.array(SystemLogRecordSchema),
    pagination: PaginationSchema,
  })
);

export const SystemLogResponseSchema = SuccessEnvelopeSchema(SystemLogRecordSchema);

export const RecordSystemLogPayloadSchema = z.object({
  action: z.string().min(1),
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  description: z.string().min(1).max(500),
  changes: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type RecordSystemLogPayload = z.infer<typeof RecordSystemLogPayloadSchema>;
