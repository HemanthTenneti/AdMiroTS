/**
 * Advertisement List Request/Response DTOs
 */

import { MediaType, AdStatus } from "@admiro/domain";
import { PaginationQuery, PaginatedResponse } from "../common/pagination";
import { Timestamps } from "../common/timestamps";

export interface AdFilterQuery extends PaginationQuery {
  status: AdStatus | undefined;
  mediaType: MediaType | undefined;
  advertiserId: string | undefined;
}

export interface AdListItem extends Timestamps {
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

export type AdListResponse = PaginatedResponse<AdListItem>;
