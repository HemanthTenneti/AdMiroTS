import { IAdvertisement } from "../interfaces";
import { AdStatus, MediaType } from "../enums";

/**
 * Advertisement entity class
 * Encapsulates advertisement business logic and status management
 */
export class Advertisement implements IAdvertisement {
  id: string;
  adId: string;
  advertiserId: string;
  adName: string;
  mediaUrl: string;
  mediaObjectKey?: string | undefined;
  mediaType: MediaType;
  thumbnailUrl?: string | undefined;
  duration: number;
  description?: string | undefined;
  status: AdStatus;
  targetAudience?: string | undefined;
  fileSize?: number | undefined;
  views: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IAdvertisement) {
    this.id = data.id;
    this.adId = data.adId;
    this.advertiserId = data.advertiserId;
    this.adName = data.adName;
    this.mediaUrl = data.mediaUrl;
    this.mediaObjectKey = data.mediaObjectKey ?? undefined;
    this.mediaType = data.mediaType;
    this.thumbnailUrl = data.thumbnailUrl ?? undefined;
    this.duration = data.duration;
    this.description = data.description ?? undefined;
    this.status = data.status;
    this.targetAudience = data.targetAudience ?? undefined;
    this.fileSize = data.fileSize ?? undefined;
    this.views = data.views;
    this.clicks = data.clicks;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Check if advertisement is currently displayable
   * Only active ads can be shown on displays
   */
  isDisplayable(): boolean {
    return this.status === AdStatus.ACTIVE;
  }

  /**
   * Check if advertisement is an image
   */
  isImage(): boolean {
    return this.mediaType === MediaType.IMAGE;
  }

  /**
   * Check if advertisement is a video
   */
  isVideo(): boolean {
    return this.mediaType === MediaType.VIDEO;
  }

  /**
   * Increment view counter
   * Called when ad is displayed on a screen
   */
  incrementViews(): void {
    this.views += 1;
    this.updatedAt = new Date();
  }

  /**
   * Increment click counter
   * Called when user interacts with the ad
   */
  incrementClicks(): void {
    this.clicks += 1;
    this.updatedAt = new Date();
  }

  /**
   * Calculate click-through rate (CTR)
   * Returns percentage of views that resulted in clicks
   */
  getClickThroughRate(): number {
    if (this.views === 0) {
      return 0;
    }
    return (this.clicks / this.views) * 100;
  }

  /**
   * Update advertisement status
   */
  updateStatus(newStatus: AdStatus): void {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  /**
   * Pause advertisement
   * Prevents ad from being displayed without deleting it
   */
  pause(): void {
    this.status = AdStatus.PAUSED;
    this.updatedAt = new Date();
  }

  /**
   * Activate advertisement
   * Makes ad available for display
   */
  activate(): void {
    this.status = AdStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Mark advertisement as expired
   * Used when campaign end date is reached
   */
  expire(): void {
    this.status = AdStatus.EXPIRED;
    this.updatedAt = new Date();
  }

  /**
   * Get human-readable file size
   * Converts bytes to KB/MB/GB
   */
  getFormattedFileSize(): string {
    if (!this.fileSize) {
      return "Unknown";
    }

    const bytes = this.fileSize;
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  /**
   * Validate duration range
   * Duration must be between 1 and 300 seconds
   */
  static isValidDuration(duration: number): boolean {
    return duration >= 1 && duration <= 300;
  }

  /**
   * Validate ad name length
   * Name must be at least 3 characters
   */
  static isValidAdName(adName: string): boolean {
    return adName.length >= 3;
  }

  /**
   * Validate file size
   * Maximum 100MB (104857600 bytes)
   */
  static isValidFileSize(fileSize: number): boolean {
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    return fileSize <= MAX_FILE_SIZE;
  }
}
