/**
 * Create Advertisement Request/Response DTOs
 */

import { MediaType, AdStatus } from "@admiro/domain";
import { Timestamps } from "../common/timestamps";

export interface CreateAdRequest {
  adName: string;
  mediaUrl: string;
  mediaType: MediaType;
  thumbnailUrl: string | undefined;
  duration: number;
  description: string | undefined;
  targetAudience: string | undefined;
}

export interface CreateAdResponse extends Timestamps {
  id: string;
  adId: string;
  advertiserId: string;
  adName: string;
  mediaUrl: string;
  mediaType: MediaType;
  thumbnailUrl: string | undefined;
  duration: number;
  description: string | undefined;
  status: AdStatus;
  targetAudience: string | undefined;
  views: number;
  clicks: number;
}
