/**
 * Loop advertisement entry value object
 * Represents an advertisement within a display loop with its ordering and metadata
 * Immutable once created
 */
export class LoopAdvertisementEntry {
    advertisementId;
    order;
    duration;
    weight;
    constructor(advertisementId, // FK to Advertisement
    order, // Position in loop (0-indexed)
    duration, // Duration in seconds
    weight = 1 // Weight for weighted rotation (default: 1)
    ) {
        this.advertisementId = advertisementId;
        this.order = order;
        this.duration = duration;
        this.weight = weight;
        if (!advertisementId || advertisementId.trim().length === 0) {
            throw new Error("Advertisement ID is required");
        }
        if (order < 0) {
            throw new Error("Order must be non-negative");
        }
        if (duration <= 0) {
            throw new Error("Duration must be positive");
        }
        if (weight < 0) {
            throw new Error("Weight must be non-negative");
        }
    }
    /**
     * Create with new order
     */
    withOrder(newOrder) {
        return new LoopAdvertisementEntry(this.advertisementId, newOrder, this.duration, this.weight);
    }
    /**
     * Create with new weight
     */
    withWeight(newWeight) {
        return new LoopAdvertisementEntry(this.advertisementId, this.order, this.duration, newWeight);
    }
    /**
     * Compare for sorting by order
     */
    compareTo(other) {
        return this.order - other.order;
    }
}
