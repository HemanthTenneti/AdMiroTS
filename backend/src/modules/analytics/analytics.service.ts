/**
 * Analytics Service
 * Handles business logic for analytics operations.
 */
import { Analytics, EngagementMetrics } from "@admiro/domain";
import { AnalyticsRepository } from "../../services/repositories/AnalyticsRepository";
import { DisplayRepository } from "../../services/repositories/DisplayRepository";
import { AdvertisementRepository } from "../../services/repositories/AdvertisementRepository";
import { NotFoundError } from "../../utils/errors/NotFoundError";
import { Logger } from "../../utils/logger";
import { RecordAnalyticsInput, AggregatedAnalyticsResponse } from "./analytics.types";

const ALLOWED_SORT_FIELDS = ["timestamp", "impressions", "viewDuration", "completedViews"] as const;

type TimelineBucket = {
  label: string;
  impressions: number;
  clicks: number;
  completedViews: number;
  partialViews: number;
};

export class AnalyticsService {
  private readonly analyticsRepository: AnalyticsRepository;
  private readonly displayRepository: DisplayRepository;
  private readonly advertisementRepository: AdvertisementRepository;

  constructor() {
    this.analyticsRepository = new AnalyticsRepository();
    this.displayRepository = new DisplayRepository();
    this.advertisementRepository = new AdvertisementRepository();
  }

  async recordEvent(data: RecordAnalyticsInput): Promise<Analytics> {
    const createData: {
      displayId: string;
      adId: string;
      loopId: string;
      impressions?: number;
      viewDuration?: number;
      completedViews?: number;
      partialViews?: number;
      engagementMetrics?: EngagementMetrics;
      metadata?: Record<string, unknown>;
    } = {
      displayId: data.displayId,
      adId: data.adId,
      loopId: data.loopId,
    };

    if (data.impressions !== undefined) createData.impressions = data.impressions;
    if (data.viewDuration !== undefined) createData.viewDuration = data.viewDuration;
    if (data.completedViews !== undefined) createData.completedViews = data.completedViews;
    if (data.partialViews !== undefined) createData.partialViews = data.partialViews;
    if (data.metadata !== undefined) createData.metadata = data.metadata;

    if (data.metrics) {
      createData.engagementMetrics = new EngagementMetrics(
        data.metrics.clicks ?? 0,
        data.metrics.interactions ?? 0,
        data.metrics.dwellTime ?? 0
      );
    }

    const analytics = Analytics.create(createData);
    const created = await this.analyticsRepository.create(analytics as any);
    Logger.info(`Analytics event recorded for display ${data.displayId}, ad ${data.adId}`);
    return created;
  }

  async getAnalytics(id: string): Promise<Analytics> {
    const analytics = await this.analyticsRepository.findById(id);
    if (!analytics) {
      throw new NotFoundError(`Analytics record with ID ${id} not found`);
    }
    return analytics;
  }

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

  async getAggregatedAnalytics(filters: {
    displayId?: string;
    adId?: string;
    loopId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AggregatedAnalyticsResponse> {
    const { data } = await this.listAnalytics(1, 1000, filters);

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

  async getOverviewStats(): Promise<{
    totalViews: number;
    totalClicks: number;
    activeDisplays: number;
    activeAds: number;
  }> {
    const [aggregated, displays, activeAds] = await Promise.all([
      this.getAggregatedAnalytics({}),
      this.displayRepository.findByStatus("online"),
      this.advertisementRepository.findActive(),
    ]);

    return {
      totalViews: aggregated.totalImpressions,
      totalClicks: aggregated.totalClicks,
      activeDisplays: displays.length,
      activeAds: activeAds.length,
    };
  }

  async getDisplayStats(displayId: string): Promise<AggregatedAnalyticsResponse> {
    return this.getAggregatedAnalytics({ displayId });
  }

  async getAdvertisementStats(adId: string): Promise<AggregatedAnalyticsResponse> {
    return this.getAggregatedAnalytics({ adId });
  }

  async getTimeline(params: {
    from?: string;
    to?: string;
    interval?: "hour" | "day";
  }): Promise<TimelineBucket[]> {
    const interval = params.interval === "hour" ? "hour" : "day";
    const { data } = await this.listAnalytics(1, 5000, {
      startDate: params.from,
      endDate: params.to,
      sortBy: "timestamp",
      sortOrder: "asc",
    });

    const buckets = new Map<string, TimelineBucket>();

    for (const entry of data) {
      const ts = new Date(entry.timestamp);
      const label = interval === "hour"
        ? `${ts.getUTCFullYear()}-${String(ts.getUTCMonth() + 1).padStart(2, "0")}-${String(ts.getUTCDate()).padStart(2, "0")} ${String(ts.getUTCHours()).padStart(2, "0")}:00`
        : `${ts.getUTCFullYear()}-${String(ts.getUTCMonth() + 1).padStart(2, "0")}-${String(ts.getUTCDate()).padStart(2, "0")}`;

      const current = buckets.get(label) ?? {
        label,
        impressions: 0,
        clicks: 0,
        completedViews: 0,
        partialViews: 0,
      };

      current.impressions += entry.impressions;
      current.clicks += entry.engagementMetrics.clicks;
      current.completedViews += entry.completedViews;
      current.partialViews += entry.partialViews;

      buckets.set(label, current);
    }

    return [...buckets.values()].sort((a, b) => a.label.localeCompare(b.label));
  }
}

export default AnalyticsService;
