/**
 * Update Advertisement Request/Response DTOs
 */

import { MediaType, AdStatus } from "@admiro/domain";
import { Timestamps } from "../common/timestamps";

export interface UpdateAdRequest {
  adName: string | undefined;
  description: string | undefined;
  targetAudience: string | undefined;
  status: AdStatus | undefined;
}

export interface UpdateAdResponse extends Timestamps {
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
