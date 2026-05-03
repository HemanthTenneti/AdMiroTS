import { z } from "zod";
import { PaginationSchema, SuccessEnvelopeSchema } from "./common";

export const ConnectionRequestSchema = z
  .object({
    id: z.string(),
    requestId: z.string(),
    displayId: z.string(),
    displayName: z.string().optional(),
    location: z.string().optional(),
    status: z.enum(["pending", "approved", "rejected"]),
    requestedAt: z.string().optional(),
    respondedAt: z.string().optional(),
    approvedAt: z.string().optional(),
    rejectedAt: z.string().optional(),
    rejectionReason: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    display: z
      .object({
        id: z.string(),
        displayId: z.string(),
        displayName: z.string(),
        location: z.string(),
        status: z.string(),
        assignedAdminId: z.string().optional(),
      })
      .nullable()
      .optional(),
  })
  .transform((value) => ({
    ...value,
    displayName: value.displayName ?? value.display?.displayName,
    location: value.location ?? value.display?.location,
  }));

export const ConnectionRequestListResponseSchema = SuccessEnvelopeSchema(
  z.object({
    data: z.array(ConnectionRequestSchema),
    pagination: PaginationSchema,
  })
);

export const RejectConnectionRequestPayloadSchema = z.object({
  rejectionReason: z.string().max(500).optional(),
});

export type RejectConnectionRequestPayload = z.infer<typeof RejectConnectionRequestPayloadSchema>;
