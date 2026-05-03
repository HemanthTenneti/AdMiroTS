import { z } from "zod";
import { PaginationSchema, SuccessEnvelopeSchema } from "./common";

export const ConnectionRequestSchema = z
  .object({
    id: z.string().optional(),
    requestId: z.string().optional(),
    displayId: z.string().optional(),
    displayName: z.string().optional(),
    displayLocation: z.string().optional(),
    location: z.string().optional(),
    status: z.enum(["pending", "approved", "rejected"]).catch("pending"),
    requestedAt: z.string().nullable().optional(),
    respondedAt: z.string().nullable().optional(),
    approvedAt: z.string().nullable().optional(),
    rejectedAt: z.string().nullable().optional(),
    rejectionReason: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
    display: z
      .object({
        id: z.string(),
        displayId: z.string(),
        displayName: z.string(),
        location: z.string(),
        status: z.string(),
        assignedAdminId: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .transform((value) => ({
    ...value,
    id: value.id ?? value.requestId ?? value.displayId ?? "",
    requestId: value.requestId ?? value.id ?? value.displayId ?? "",
    displayId: value.displayId ?? value.display?.id ?? "",
    displayName: value.displayName ?? value.display?.displayName,
    location: value.location ?? value.displayLocation ?? value.display?.location,
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
