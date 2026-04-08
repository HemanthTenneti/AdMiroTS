/**
 * System Log Repository
 * Handles all database operations for SystemLog entities
 */
import { BaseRepository } from "../base/BaseRepository";
import { ISystemLog, SystemLog } from "@admiro/domain";
import { SystemLogModel } from "../../config/db";

export class SystemLogRepository extends BaseRepository<SystemLog> {
  constructor() {
    super(SystemLogModel);
  }

  async findByAction(action: string): Promise<SystemLog[]> {
    const docs = await this.model.find({ action });
    return docs.map((doc: any) => new SystemLog(doc.toObject() as ISystemLog));
  }

  async findByUserId(userId: string): Promise<SystemLog[]> {
    const docs = await this.model.find({ userId });
    return docs.map((doc: any) => new SystemLog(doc.toObject() as ISystemLog));
  }

  async findByEntity(entityType: string, entityId: string): Promise<SystemLog[]> {
    const docs = await this.model.find({ entityType, entityId });
    return docs.map((doc: any) => new SystemLog(doc.toObject() as ISystemLog));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<SystemLog[]> {
    const docs = await this.model.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });
    return docs.map((doc: any) => new SystemLog(doc.toObject() as ISystemLog));
  }
}

export default SystemLogRepository;
