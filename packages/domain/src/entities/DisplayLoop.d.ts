import { IDisplayLoop } from "../interfaces";
import { RotationType, DisplayLayout } from "../enums";
import { LoopAdvertisementEntry } from "../value-objects/LoopAdvertisementEntry";
/**
 * Display loop entity class
 * Encapsulates advertisement playlist business logic
 */
export declare class DisplayLoop implements IDisplayLoop {
    id: string;
    loopId: string;
    loopName: string;
    displayId: string;
    advertisements: LoopAdvertisementEntry[];
    rotationType: RotationType;
    displayLayout: DisplayLayout;
    totalDuration: number;
    isActive: boolean;
    description?: string | undefined;
    createdAt: Date;
    updatedAt: Date;
    constructor(data: IDisplayLoop);
    /**
     * Check if loop uses sequential rotation
     */
    isSequential(): boolean;
    /**
     * Check if loop uses random rotation
     */
    isRandom(): boolean;
    /**
     * Check if loop uses weighted rotation
     */
    isWeighted(): boolean;
    /**
     * Check if loop uses fullscreen layout
     */
    isFullscreen(): boolean;
    /**
     * Check if loop uses masonry layout
     */
    isMasonry(): boolean;
    /**
     * Check if loop has advertisements
     */
    hasAdvertisements(): boolean;
    /**
     * Get number of advertisements in loop
     */
    getAdvertisementCount(): number;
    /**
     * Add advertisement to loop
     * Recalculates total duration and assigns order
     */
    addAdvertisement(entry: LoopAdvertisementEntry): void;
    /**
     * Remove advertisement from loop by advertisement ID
     * Recalculates total duration and reorders remaining ads
     */
    removeAdvertisement(advertisementId: string): void;
    /**
     * Reorder advertisements sequentially
     * Ensures order values are continuous (0, 1, 2, ...)
     */
    private reorderAdvertisements;
    /**
     * Recalculate total duration from all advertisements
     */
    private recalculateTotalDuration;
    /**
     * Update advertisement order
     * Swaps positions of two advertisements
     */
    updateAdvertisementOrder(advertisementId: string, newOrder: number): void;
    /**
     * Activate loop
     */
    activate(): void;
    /**
     * Deactivate loop
     */
    deactivate(): void;
    /**
     * Update rotation type
     */
    updateRotationType(rotationType: RotationType): void;
    /**
     * Update display layout
     */
    updateDisplayLayout(layout: DisplayLayout): void;
    /**
     * Get advertisement at specific order position
     */
    getAdvertisementAtPosition(position: number): LoopAdvertisementEntry | null;
    /**
     * Get next advertisement based on rotation type
     * For sequential: returns next in order
     * For random: returns random advertisement
     * For weighted: returns based on weight
     */
    getNextAdvertisement(currentPosition?: number): LoopAdvertisementEntry | null;
    /**
     * Get next advertisement in sequential order
     */
    private getNextSequential;
    /**
     * Get random advertisement
     */
    private getNextRandom;
    /**
     * Get advertisement based on weighted distribution
     * Higher weight = higher probability of selection
     */
    private getNextWeighted;
    /**
     * Validate loop name length
     */
    static isValidLoopName(name: string): boolean;
}
//# sourceMappingURL=DisplayLoop.d.ts.map