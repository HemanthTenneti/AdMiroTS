import { AdStatus, MediaType } from "../enums";

/**
 * Advertisement entity interface
 * Represents a digital advertisement (image or video)
 */
export interface IAdvertisement {
  id: string;
  adId: string; // Format: "AD-{UUID}"
  advertiserId: string; // FK to User
  adName: string;
  mediaUrl: string; // Base64 data URL or external URL
  mediaObjectKey?: string | undefined;
  mediaType: MediaType;
  thumbnailUrl?: string | undefined;
  duration: number; // In seconds (1-300)
  description?: string | undefined;
  status: AdStatus;
  targetAudience?: string | undefined;
  fileSize?: number | undefined; // In bytes
  views: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}
