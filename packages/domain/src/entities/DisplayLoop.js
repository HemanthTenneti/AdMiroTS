import { RotationType, DisplayLayout } from "../enums";
/**
 * Display loop entity class
 * Encapsulates advertisement playlist business logic
 */
export class DisplayLoop {
    id;
    loopId;
    loopName;
    displayId;
    advertisements;
    rotationType;
    displayLayout;
    totalDuration;
    isActive;
    description;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id;
        this.loopId = data.loopId;
        this.loopName = data.loopName;
        this.displayId = data.displayId;
        this.advertisements = data.advertisements;
        this.rotationType = data.rotationType;
        this.displayLayout = data.displayLayout;
        this.totalDuration = data.totalDuration;
        this.isActive = data.isActive;
        this.description = data.description ?? undefined;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
    /**
     * Check if loop uses sequential rotation
     */
    isSequential() {
        return this.rotationType === RotationType.SEQUENTIAL;
    }
    /**
     * Check if loop uses random rotation
     */
    isRandom() {
        return this.rotationType === RotationType.RANDOM;
    }
    /**
     * Check if loop uses weighted rotation
     */
    isWeighted() {
        return this.rotationType === RotationType.WEIGHTED;
    }
    /**
     * Check if loop uses fullscreen layout
     */
    isFullscreen() {
        return this.displayLayout === DisplayLayout.FULLSCREEN;
    }
    /**
     * Check if loop uses masonry layout
     */
    isMasonry() {
        return this.displayLayout === DisplayLayout.MASONRY;
    }
    /**
     * Check if loop has advertisements
     */
    hasAdvertisements() {
        return this.advertisements.length > 0;
    }
    /**
     * Get number of advertisements in loop
     */
    getAdvertisementCount() {
        return this.advertisements.length;
    }
    /**
     * Add advertisement to loop
     * Recalculates total duration and assigns order
     */
    addAdvertisement(entry) {
        this.advertisements.push(entry);
        this.recalculateTotalDuration();
        this.updatedAt = new Date();
    }
    /**
     * Remove advertisement from loop by advertisement ID
     * Recalculates total duration and reorders remaining ads
     */
    removeAdvertisement(advertisementId) {
        this.advertisements = this.advertisements.filter((ad) => ad.advertisementId !== advertisementId);
        this.reorderAdvertisements();
        this.recalculateTotalDuration();
        this.updatedAt = new Date();
    }
    /**
     * Reorder advertisements sequentially
     * Ensures order values are continuous (0, 1, 2, ...)
     */
    reorderAdvertisements() {
        this.advertisements = this.advertisements
            .sort((a, b) => a.order - b.order)
            .map((ad, index) => ad.withOrder(index));
    }
    /**
     * Recalculate total duration from all advertisements
     */
    recalculateTotalDuration() {
        this.totalDuration = this.advertisements.reduce((sum, ad) => sum + ad.duration, 0);
    }
    /**
     * Update advertisement order
     * Swaps positions of two advertisements
     */
    updateAdvertisementOrder(advertisementId, newOrder) {
        const adIndex = this.advertisements.findIndex((ad) => ad.advertisementId === advertisementId);
        if (adIndex === -1) {
            throw new Error(`Advertisement ${advertisementId} not found in loop`);
        }
        if (newOrder < 0 || newOrder >= this.advertisements.length) {
            throw new Error(`Invalid order: ${newOrder}`);
        }
        // Remove ad from current position
        const ad = this.advertisements[adIndex];
        if (!ad) {
            throw new Error("Advertisement not found at index");
        }
        this.advertisements.splice(adIndex, 1);
        // Insert at new position
        this.advertisements.splice(newOrder, 0, ad);
        // Reorder all ads
        this.reorderAdvertisements();
        this.updatedAt = new Date();
    }
    /**
     * Activate loop
     */
    activate() {
        this.isActive = true;
        this.updatedAt = new Date();
    }
    /**
     * Deactivate loop
     */
    deactivate() {
        this.isActive = false;
        this.updatedAt = new Date();
    }
    /**
     * Update rotation type
     */
    updateRotationType(rotationType) {
        this.rotationType = rotationType;
        this.updatedAt = new Date();
    }
    /**
     * Update display layout
     */
    updateDisplayLayout(layout) {
        this.displayLayout = layout;
        this.updatedAt = new Date();
    }
    /**
     * Get advertisement at specific order position
     */
    getAdvertisementAtPosition(position) {
        return this.advertisements.find((ad) => ad.order === position) ?? null;
    }
    /**
     * Get next advertisement based on rotation type
     * For sequential: returns next in order
     * For random: returns random advertisement
     * For weighted: returns based on weight
     */
    getNextAdvertisement(currentPosition) {
        if (this.advertisements.length === 0) {
            return null;
        }
        switch (this.rotationType) {
            case RotationType.SEQUENTIAL:
                return this.getNextSequential(currentPosition);
            case RotationType.RANDOM:
                return this.getNextRandom();
            case RotationType.WEIGHTED:
                return this.getNextWeighted();
            default:
                return this.advertisements[0] ?? null;
        }
    }
    /**
     * Get next advertisement in sequential order
     */
    getNextSequential(currentPosition) {
        if (currentPosition === undefined) {
            return this.advertisements[0] ?? null;
        }
        const nextPosition = (currentPosition + 1) % this.advertisements.length;
        return this.advertisements[nextPosition] ?? null;
    }
    /**
     * Get random advertisement
     */
    getNextRandom() {
        const randomIndex = Math.floor(Math.random() * this.advertisements.length);
        return this.advertisements[randomIndex] ?? null;
    }
    /**
     * Get advertisement based on weighted distribution
     * Higher weight = higher probability of selection
     */
    getNextWeighted() {
        const totalWeight = this.advertisements.reduce((sum, ad) => sum + ad.weight, 0);
        if (totalWeight === 0) {
            return this.getNextRandom();
        }
        let random = Math.random() * totalWeight;
        for (const ad of this.advertisements) {
            random -= ad.weight;
            if (random <= 0) {
                return ad;
            }
        }
        return this.advertisements[0] ?? null;
    }
    /**
     * Validate loop name length
     */
    static isValidLoopName(name) {
        return name.length >= 3;
    }
}
