/**
 * Loop advertisement entry value object
 * Represents an advertisement within a display loop with its ordering and metadata
 * Immutable once created
 */
export class LoopAdvertisementEntry {
  constructor(
    public readonly advertisementId: string, // FK to Advertisement
    public readonly order: number, // Position in loop (0-indexed)
    public readonly duration: number, // Duration in seconds
    public readonly weight: number = 1 // Weight for weighted rotation (default: 1)
  ) {
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
  withOrder(newOrder: number): LoopAdvertisementEntry {
    return new LoopAdvertisementEntry(
      this.advertisementId,
      newOrder,
      this.duration,
      this.weight
    );
  }

  /**
   * Create with new weight
   */
  withWeight(newWeight: number): LoopAdvertisementEntry {
    return new LoopAdvertisementEntry(
      this.advertisementId,
      this.order,
      this.duration,
      newWeight
    );
  }

  /**
   * Compare for sorting by order
   */
  compareTo(other: LoopAdvertisementEntry): number {
    return this.order - other.order;
  }
}

