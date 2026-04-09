/**
 * Analytics Service
 * Handles business logic for analytics operations
 */
import { Analytics, EngagementMetrics } from "@admiro/domain";
import { AnalyticsRepository } from "../../services/repositories/AnalyticsRepository";
import { NotFoundError } from "../../utils/errors/NotFoundError";
import { Logger } from "../../utils/logger";
import { RecordAnalyticsInput, AggregatedAnalyticsResponse } from "./analytics.types";

const ALLOWED_SORT_FIELDS = ["timestamp", "impressions", "viewDuration", "completedViews"] as const;

export class AnalyticsService {
  private analyticsRepository: AnalyticsRepository;

  constructor() {
    this.analyticsRepository = new AnalyticsRepository();
  }

  /**
   * Record a new analytics event
   */
  async recordEvent(data: RecordAnalyticsInput): Promise<Analytics> {
    const analytics = Analytics.create({
      displayId: data.displayId,
      adId: data.adId,
      loopId: data.loopId,
      impressions: data.impressions,
      viewDuration: data.viewDuration,
      completedViews: data.completedViews,
      partialViews: data.partialViews,
      engagementMetrics: data.metrics ? new EngagementMetrics({
        clicks: data.metrics.clicks ?? 0,
        interactions: data.metrics.interactions ?? 0,
        dwellTime: data.metrics.dwellTime ?? 0,
      }) : undefined,
      metadata: data.metadata,
    });

    const created = await this.analyticsRepository.create(analytics as any);
    Logger.info(`Analytics event recorded for display ${data.displayId}, ad ${data.adId}`);
    return created;
  }

  /**
   * Get analytics by ID
   */
  async getAnalytics(id: string): Promise<Analytics> {
    const analytics = await this.analyticsRepository.findById(id);
    if (!analytics) {
      throw new NotFoundError(`Analytics record with ID ${id} not found`);
    }
    return analytics;
  }

  /**
   * List analytics with pagination and filters
   */
  async listAnalytics(
    page: number,
    limit: number,
    filters?: {
      displayId?: string;
      adId?: string;
      loopId?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<{ data: Analytics[]; total: number }> {
    const filterObj: Record<string, any> = {};
    if (filters?.displayId) filterObj.displayId = filters.displayId;
    if (filters?.adId) filterObj.adId = filters.adId;
    if (filters?.loopId) filterObj.loopId = filters.loopId;

    if (filters?.startDate || filters?.endDate) {
      filterObj.timestamp = {};
      if (filters.startDate) filterObj.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) filterObj.timestamp.$lte = new Date(filters.endDate);
    }

    let sortBy = "timestamp";
    if (filters?.sortBy && ALLOWED_SORT_FIELDS.includes(filters.sortBy as any)) {
      sortBy = filters.sortBy;
    }

    return this.analyticsRepository.findWithPagination(
      filterObj,
      page,
      limit,
      sortBy as any,
      filters?.sortOrder ?? "desc"
    );
  }

  /**
   * Get aggregated analytics for an ad, display, or loop
   */
  async getAggregatedAnalytics(filters: {
    displayId?: string;
    adId?: string;
    loopId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AggregatedAnalyticsResponse> {
    const { data } = await this.listAnalytics(1, 1000, filters); // Simplified aggregation for prototype

    const initial: AggregatedAnalyticsResponse = {
      totalImpressions: 0,
      totalViews: 0,
      completedViews: 0,
      partialViews: 0,
      totalClicks: 0,
      averageCTR: 0,
      averageViewDuration: 0,
      totalViewDuration: 0,
    };

    if (data.length === 0) return initial;

    const aggregate = data.reduce((acc, entry) => {
      acc.totalImpressions += entry.impressions;
      acc.completedViews += entry.completedViews;
      acc.partialViews += entry.partialViews;
      acc.totalViewDuration += entry.viewDuration;
      acc.totalClicks += entry.engagementMetrics.clicks;
      return acc;
    }, initial);

    aggregate.totalViews = aggregate.completedViews + aggregate.partialViews;
    aggregate.averageCTR = aggregate.totalImpressions > 0 
      ? (aggregate.totalClicks / aggregate.totalImpressions) * 100 
      : 0;
    aggregate.averageViewDuration = aggregate.totalViews > 0 
      ? aggregate.totalViewDuration / aggregate.totalViews 
      : 0;

    return aggregate;
  }
}

export default AnalyticsService;
