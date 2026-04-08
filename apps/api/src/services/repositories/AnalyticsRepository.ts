/**
 * Analytics Repository
 * Handles all database operations for Analytics entities
 */
import { BaseRepository } from "../base/BaseRepository";
import { IAnalytics, Analytics } from "@admiro/domain";
import { AnalyticsModel } from "../../config/db";

export class AnalyticsRepository extends BaseRepository<Analytics> {
  constructor() {
    super(AnalyticsModel);
  }

  async findByDisplayId(displayId: string): Promise<Analytics | null> {
    const doc = await this.model.findOne({ displayId });
    if (!doc) return null;
    return new Analytics(doc.toObject() as IAnalytics);
  }

  async findByAdvertisementId(adId: string): Promise<Analytics | null> {
    const doc = await this.model.findOne({ adId });
    if (!doc) return null;
    return new Analytics(doc.toObject() as IAnalytics);
  }

  async findByLoopId(loopId: string): Promise<Analytics | null> {
    const doc = await this.model.findOne({ loopId });
    if (!doc) return null;
    return new Analytics(doc.toObject() as IAnalytics);
  }

  async updateEngagementMetrics(
    id: string,
    metrics: { clicks?: number; interactions?: number; dwellTime?: number }
  ): Promise<void> {
    const update: any = {};
    if (metrics.clicks !== undefined) update["engagementMetrics.clicks"] = metrics.clicks;
    if (metrics.interactions !== undefined) update["engagementMetrics.interactions"] = metrics.interactions;
    if (metrics.dwellTime !== undefined) update["engagementMetrics.dwellTime"] = metrics.dwellTime;

    await this.model.findByIdAndUpdate(id, update);
  }
}

export default AnalyticsRepository;
