import { IAdvertisement } from "../interfaces";
import { AdStatus, MediaType } from "../enums";
/**
 * Advertisement entity class
 * Encapsulates advertisement business logic and status management
 */
export declare class Advertisement implements IAdvertisement {
    id: string;
    adId: string;
    advertiserId: string;
    adName: string;
    mediaUrl: string;
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
    constructor(data: IAdvertisement);
    /**
     * Check if advertisement is currently displayable
     * Only active ads can be shown on displays
     */
    isDisplayable(): boolean;
    /**
     * Check if advertisement is an image
     */
    isImage(): boolean;
    /**
     * Check if advertisement is a video
     */
    isVideo(): boolean;
    /**
     * Increment view counter
     * Called when ad is displayed on a screen
     */
    incrementViews(): void;
    /**
     * Increment click counter
     * Called when user interacts with the ad
     */
    incrementClicks(): void;
    /**
     * Calculate click-through rate (CTR)
     * Returns percentage of views that resulted in clicks
     */
    getClickThroughRate(): number;
    /**
     * Update advertisement status
     */
    updateStatus(newStatus: AdStatus): void;
    /**
     * Pause advertisement
     * Prevents ad from being displayed without deleting it
     */
    pause(): void;
    /**
     * Activate advertisement
     * Makes ad available for display
     */
    activate(): void;
    /**
     * Mark advertisement as expired
     * Used when campaign end date is reached
     */
    expire(): void;
    /**
     * Get human-readable file size
     * Converts bytes to KB/MB/GB
     */
    getFormattedFileSize(): string;
    /**
     * Validate duration range
     * Duration must be between 1 and 300 seconds
     */
    static isValidDuration(duration: number): boolean;
    /**
     * Validate ad name length
     * Name must be at least 3 characters
     */
    static isValidAdName(adName: string): boolean;
    /**
     * Validate file size
     * Maximum 100MB (104857600 bytes)
     */
    static isValidFileSize(fileSize: number): boolean;
}
//# sourceMappingURL=Advertisement.d.ts.map