import { EngagementMetrics } from "../value-objects/EngagementMetrics";
/**
 * Analytics entity class
 * Encapsulates engagement and performance metrics business logic
 */
export class Analytics {
    id;
    displayId;
    adId;
    loopId;
    impressions;
    engagementMetrics;
    viewDuration;
    completedViews;
    partialViews;
    timestamp;
    date;
    metadata;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id;
        this.displayId = data.displayId;
        this.adId = data.adId;
        this.loopId = data.loopId;
        this.impressions = data.impressions;
        this.engagementMetrics = data.engagementMetrics;
        this.viewDuration = data.viewDuration;
        this.completedViews = data.completedViews;
        this.partialViews = data.partialViews;
        this.timestamp = data.timestamp;
        this.date = data.date;
        this.metadata = data.metadata ?? undefined;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
    /**
     * Increment impression counter
     */
    incrementImpressions(count = 1) {
        this.impressions += count;
        this.updatedAt = new Date();
    }
    /**
     * Increment completed views
     * Called when ad plays to completion
     */
    incrementCompletedViews(count = 1) {
        this.completedViews += count;
        this.updatedAt = new Date();
    }
    /**
     * Increment partial views
     * Called when ad doesn't play to completion
     */
    incrementPartialViews(count = 1) {
        this.partialViews += count;
        this.updatedAt = new Date();
    }
    /**
     * Add view duration
     */
    addViewDuration(seconds) {
        this.viewDuration += seconds;
        this.updatedAt = new Date();
    }
    /**
     * Calculate completion rate
     * Percentage of views that were completed
     */
    getCompletionRate() {
        const totalViews = this.completedViews + this.partialViews;
        if (totalViews === 0) {
            return 0;
        }
        return (this.completedViews / totalViews) * 100;
    }
    /**
     * Calculate average view duration
     */
    getAverageViewDuration() {
        const totalViews = this.completedViews + this.partialViews;
        if (totalViews === 0) {
            return 0;
        }
        return this.viewDuration / totalViews;
    }
    /**
     * Get total views (completed + partial)
     */
    getTotalViews() {
        return this.completedViews + this.partialViews;
    }
    /**
     * Get click-through rate from engagement metrics
     * Percentage of impressions that resulted in clicks
     */
    getClickThroughRate() {
        if (this.impressions === 0) {
            return 0;
        }
        return (this.engagementMetrics.clicks / this.impressions) * 100;
    }
    /**
     * Get engagement rate
     * Percentage of impressions that had any interaction
     */
    getEngagementRate() {
        if (this.impressions === 0) {
            return 0;
        }
        return (this.engagementMetrics.interactions / this.impressions) * 100;
    }
    /**
     * Update engagement metrics
     */
    updateEngagementMetrics(metrics) {
        this.engagementMetrics = this.engagementMetrics.add(metrics);
        this.updatedAt = new Date();
    }
    /**
     * Check if analytics has metadata
     */
    hasMetadata() {
        return !!this.metadata;
    }
    /**
     * Get device type from metadata
     */
    getDeviceType() {
        return this.metadata?.deviceType ?? null;
    }
    /**
     * Get location from metadata
     */
    getLocation() {
        return this.metadata?.location ?? null;
    }
    /**
     * Create analytics entry
     * Factory method for creating new analytics records
     */
    static create(params) {
        const now = new Date();
        const dateOnly = new Date(now);
        dateOnly.setHours(0, 0, 0, 0);
        return new Analytics({
            id: crypto.randomUUID(),
            displayId: params.displayId,
            adId: params.adId,
            loopId: params.loopId,
            impressions: params.impressions ?? 0,
            engagementMetrics: params.engagementMetrics ?? EngagementMetrics.createEmpty(),
            viewDuration: params.viewDuration ?? 0,
            completedViews: params.completedViews ?? 0,
            partialViews: params.partialViews ?? 0,
            timestamp: now,
            date: dateOnly,
            metadata: params.metadata ?? undefined,
            createdAt: now,
            updatedAt: now,
        });
    }
    /**
     * Aggregate multiple analytics entries
     * Combines metrics from multiple entries into a single summary
     */
    static aggregate(entries) {
        if (entries.length === 0) {
            return null;
        }
        const first = entries[0];
        if (!first) {
            return null;
        }
        const aggregated = Analytics.create({
            displayId: first.displayId,
            adId: first.adId,
            loopId: first.loopId,
        });
        for (const entry of entries) {
            aggregated.impressions += entry.impressions;
            aggregated.viewDuration += entry.viewDuration;
            aggregated.completedViews += entry.completedViews;
            aggregated.partialViews += entry.partialViews;
            // Aggregate engagement metrics
            aggregated.engagementMetrics = aggregated.engagementMetrics.add({
                clicks: entry.engagementMetrics.clicks,
                interactions: entry.engagementMetrics.interactions,
                dwellTime: entry.engagementMetrics.dwellTime,
            });
        }
        return aggregated;
    }
}
