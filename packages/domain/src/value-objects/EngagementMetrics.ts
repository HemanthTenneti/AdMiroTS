/**
 * Engagement metrics value object
 * Tracks user interaction with advertisements
 * Immutable once created
 */
export class EngagementMetrics {
  constructor(
    public readonly clicks: number = 0,
    public readonly interactions: number = 0,
    public readonly dwellTime: number = 0
  ) {
    if (clicks < 0 || interactions < 0 || dwellTime < 0) {
      throw new Error("Engagement metrics cannot be negative");
    }
  }

  /**
   * Calculate engagement rate (interactions per click)
   */
  get engagementRate(): number {
    return this.clicks === 0 ? 0 : this.interactions / this.clicks;
  }

  /**
   * Calculate average dwell time per interaction
   */
  get averageDwellTime(): number {
    return this.interactions === 0 ? 0 : this.dwellTime / this.interactions;
  }

  /**
   * Add metrics to create updated copy
   */
  add(metrics: Partial<{ clicks: number; interactions: number; dwellTime: number }>): EngagementMetrics {
    return new EngagementMetrics(
      this.clicks + (metrics.clicks ?? 0),
      this.interactions + (metrics.interactions ?? 0),
      this.dwellTime + (metrics.dwellTime ?? 0)
    );
  }

  /**
   * Create empty metrics
   */
  static createEmpty(): EngagementMetrics {
    return new EngagementMetrics(0, 0, 0);
  }
}
