/**
 * Resolution value object
 * Represents the display screen dimensions
 * Immutable once created
 */
export declare class Resolution {
    readonly width: number;
    readonly height: number;
    constructor(width: number, height: number);
    /**
     * Calculate aspect ratio
     */
    get aspectRatio(): number;
    /**
     * Check if resolution is landscape
     */
    get isLandscape(): boolean;
    /**
     * Check if resolution is portrait
     */
    get isPortrait(): boolean;
    /**
     * Format as string (e.g., "1920x1080")
     */
    toString(): string;
    /**
     * Create default HD resolution
     */
    static createDefault(): Resolution;
}
//# sourceMappingURL=Resolution.d.ts.map