/**
 * Loop advertisement entry value object
 * Represents an advertisement within a display loop with its ordering and metadata
 * Immutable once created
 */
export declare class LoopAdvertisementEntry {
    readonly advertisementId: string;
    readonly order: number;
    readonly duration: number;
    readonly weight: number;
    constructor(advertisementId: string, // FK to Advertisement
    order: number, // Position in loop (0-indexed)
    duration: number, // Duration in seconds
    weight?: number);
    /**
     * Create with new order
     */
    withOrder(newOrder: number): LoopAdvertisementEntry;
    /**
     * Create with new weight
     */
    withWeight(newWeight: number): LoopAdvertisementEntry;
    /**
     * Compare for sorting by order
     */
    compareTo(other: LoopAdvertisementEntry): number;
}
//# sourceMappingURL=LoopAdvertisementEntry.d.ts.map