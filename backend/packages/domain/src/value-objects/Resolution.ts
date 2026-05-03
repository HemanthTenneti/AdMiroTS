/**
 * Resolution value object
 * Represents the display screen dimensions
 * Immutable once created
 */
export class Resolution {
  constructor(
    public readonly width: number,
    public readonly height: number
  ) {
    if (width < 100 || height < 100) {
      throw new Error("Resolution dimensions must be at least 100 pixels");
    }
    if (width > 10000 || height > 10000) {
      throw new Error("Resolution dimensions cannot exceed 10000 pixels");
    }
  }

  /**
   * Calculate aspect ratio
   */
  get aspectRatio(): number {
    return this.width / this.height;
  }

  /**
   * Check if resolution is landscape
   */
  get isLandscape(): boolean {
    return this.width > this.height;
  }

  /**
   * Check if resolution is portrait
   */
  get isPortrait(): boolean {
    return this.height > this.width;
  }

  /**
   * Format as string (e.g., "1920x1080")
   */
  toString(): string {
    return `${this.width}x${this.height}`;
  }

  /**
   * Create default HD resolution
   */
  static createDefault(): Resolution {
    return new Resolution(1920, 1080);
  }
}
