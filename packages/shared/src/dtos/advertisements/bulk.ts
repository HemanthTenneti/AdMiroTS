/**
 * Bulk Advertisement Upload Request/Response DTOs
 */

import { Timestamps } from "../common/timestamps";

export interface BulkUploadRequest {
  file: Buffer;
  fileName: string;
}

export interface BulkUploadResponse extends Timestamps {
  uploadId: string;
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}
