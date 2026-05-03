/**
 * Export System Logs Request/Response DTOs
 */

import { Timestamps } from "../common/timestamps";

export interface ExportLogsRequest {
  startDate: Date;
  endDate: Date;
  format: "csv" | "json" | "pdf";
}

export interface ExportLogsResponse extends Timestamps {
  exportId: string;
  format: "csv" | "json" | "pdf";
  downloadUrl: string;
  expiresAt: Date;
  totalRecords: number;
}
