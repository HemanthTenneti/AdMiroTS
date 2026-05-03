import { z } from "zod";
import { PaginationSchema, SuccessEnvelopeSchema } from "./common";

const LoopAdvertisementSchema = z.object({
  advertisementId: z.string(),
  duration: z.number().int().positive(),
  order: z.number().int().min(0),
  weight: z.number().int().min(1).optional(),
});

export const DisplayLoopRecordSchema = z.object({
  id: z.string(),
  loopId: z.string(),
  loopName: z.string(),
  displayId: z.string(),
  displayIds: z.array(z.string()).default([]),
  createdById: z.string().optional(),
  rotationType: z.string(),
  displayLayout: z.string(),
  isActive: z.boolean(),
  description: z.string().optional(),
  advertisements: z.array(LoopAdvertisementSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const DisplayLoopListResponseSchema = SuccessEnvelopeSchema(
  z.object({
    data: z.array(DisplayLoopRecordSchema),
    pagination: PaginationSchema,
  })
);

export const DisplayLoopResponseSchema = SuccessEnvelopeSchema(DisplayLoopRecordSchema);

export const CreateDisplayLoopPayloadSchema = z.object({
  loopName: z.string().min(3).max(255),
  displayId: z.string().min(1).optional(),
  displayIds: z.array(z.string().min(1)).optional(),
  rotationType: z.enum(["sequential", "random", "weighted"]).default("sequential"),
  displayLayout: z.enum(["fullscreen", "masonry"]).default("fullscreen"),
  description: z.string().max(1000).optional(),
});

export const UpdateDisplayLoopPayloadSchema = z.object({
  loopName: z.string().min(3).max(255).optional(),
  rotationType: z.enum(["sequential", "random", "weighted"]).optional(),
  displayLayout: z.enum(["fullscreen", "masonry"]).optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(1000).optional(),
});

export const AddLoopAdvertisementPayloadSchema = z.object({
  advertisementId: z.string().min(1),
  duration: z.number().int().positive(),
  order: z.number().int().min(0),
  weight: z.number().int().min(1).optional(),
});

export const UpdateLoopOrderPayloadSchema = z.object({
  newOrder: z.number().int().min(0),
});

export const AddDisplayToLoopPayloadSchema = z.object({
  displayId: z.string().min(1),
});

export type CreateDisplayLoopPayload = z.infer<typeof CreateDisplayLoopPayloadSchema>;
export type UpdateDisplayLoopPayload = z.infer<typeof UpdateDisplayLoopPayloadSchema>;
export type AddLoopAdvertisementPayload = z.infer<typeof AddLoopAdvertisementPayloadSchema>;
export type UpdateLoopOrderPayload = z.infer<typeof UpdateLoopOrderPayloadSchema>;
export type AddDisplayToLoopPayload = z.infer<typeof AddDisplayToLoopPayloadSchema>;
