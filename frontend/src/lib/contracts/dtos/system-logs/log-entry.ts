/**
 * Log Entry Response DTOs
 */

import { LogAction, EntityType } from "@admiro/domain";
import { PaginationQuery } from "../common/pagination";
import { Timestamps } from "../common/timestamps";

export interface LogFilterQuery extends PaginationQuery {
  action: LogAction | undefined;
  entityType: EntityType | undefined;
  userId: string | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export interface LogEntryResponse extends Timestamps {
  id: string;
  action: LogAction;
  entityType: EntityType;
  entityId: string;
  userId: string;
  details: {
    description: string;
    changes: Record<string, any> | undefined;
    metadata: Record<string, any> | undefined;
  };
  ipAddress: string | undefined;
  userAgent: string | undefined;
}
