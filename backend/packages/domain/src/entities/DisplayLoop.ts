import { IDisplayLoop } from "../interfaces";
import { RotationType, DisplayLayout } from "../enums";
import { LoopAdvertisementEntry } from "../value-objects/LoopAdvertisementEntry";

/**
 * Display loop entity class
 * Encapsulates advertisement playlist business logic
 */
export class DisplayLoop implements IDisplayLoop {
  id: string;
  loopId: string;
  loopName: string;
  displayId: string;
  displayIds: string[];
  advertisements: LoopAdvertisementEntry[];
  rotationType: RotationType;
  displayLayout: DisplayLayout;
  totalDuration: number;
  isActive: boolean;
  description?: string | undefined;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IDisplayLoop) {
    this.id = data.id;
    this.loopId = data.loopId;
    this.loopName = data.loopName;
    this.displayIds =
      Array.isArray((data as Partial<IDisplayLoop>).displayIds) &&
      (data as Partial<IDisplayLoop>).displayIds!.length > 0
        ? Array.from(new Set((data as Partial<IDisplayLoop>).displayIds!.filter(Boolean)))
        : data.displayId
          ? [data.displayId]
          : [];
    this.displayId = this.displayIds[0] ?? data.displayId ?? "";
    this.advertisements = data.advertisements.map(
      (ad: any) =>
        new LoopAdvertisementEntry(
          ad.advertisementId,
          ad.order,
          ad.duration,
          ad.weight
        )
    );
    this.rotationType = data.rotationType;
    this.displayLayout = data.displayLayout;
    this.totalDuration = data.totalDuration;
    this.isActive = data.isActive;
    this.description = data.description ?? undefined;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  assignDisplay(displayId: string): void {
    if (!displayId) return;
    if (!this.displayIds.includes(displayId)) {
      this.displayIds.push(displayId);
      this.displayId = this.displayIds[0] ?? displayId;
      this.updatedAt = new Date();
    }
  }

  unassignDisplay(displayId: string): void {
    const next = this.displayIds.filter((id) => id !== displayId);
    this.displayIds = next;
    this.displayId = next[0] ?? "";
    this.updatedAt = new Date();
  }

  /**
   * Check if loop uses sequential rotation
   */
  isSequential(): boolean {
    return this.rotationType === RotationType.SEQUENTIAL;
  }

  /**
   * Check if loop uses random rotation
   */
  isRandom(): boolean {
    return this.rotationType === RotationType.RANDOM;
  }

  /**
   * Check if loop uses weighted rotation
   */
  isWeighted(): boolean {
    return this.rotationType === RotationType.WEIGHTED;
  }

  /**
   * Check if loop uses fullscreen layout
   */
  isFullscreen(): boolean {
    return this.displayLayout === DisplayLayout.FULLSCREEN;
  }

  /**
   * Check if loop uses masonry layout
   */
  isMasonry(): boolean {
    return this.displayLayout === DisplayLayout.MASONRY;
  }

  /**
   * Check if loop has advertisements
   */
  hasAdvertisements(): boolean {
    return this.advertisements.length > 0;
  }

  /**
   * Get number of advertisements in loop
   */
  getAdvertisementCount(): number {
    return this.advertisements.length;
  }

  /**
   * Add advertisement to loop
   * Recalculates total duration and assigns order
   */
  addAdvertisement(entry: LoopAdvertisementEntry): void {
    this.advertisements.push(entry);
    this.recalculateTotalDuration();
    this.updatedAt = new Date();
  }

  /**
   * Remove advertisement from loop by advertisement ID
   * Recalculates total duration and reorders remaining ads
   */
  removeAdvertisement(advertisementId: string): void {
    this.advertisements = this.advertisements.filter(
      (ad) => ad.advertisementId !== advertisementId
    );
    this.reorderAdvertisements();
    this.recalculateTotalDuration();
    this.updatedAt = new Date();
  }

  /**
   * Reorder advertisements sequentially
   * Ensures order values are continuous (0, 1, 2, ...)
   */
  private reorderAdvertisements(): void {
    this.advertisements = this.advertisements
      .sort((a, b) => a.order - b.order)
      .map(
        (ad, index) =>
          new LoopAdvertisementEntry(ad.advertisementId, index, ad.duration, ad.weight)
      );
  }

  /**
   * Recalculate total duration from all advertisements
   */
  private recalculateTotalDuration(): void {
    this.totalDuration = this.advertisements.reduce(
      (sum, ad) => sum + ad.duration,
      0
    );
  }

  /**
   * Update advertisement order
   * Swaps positions of two advertisements
   */
  updateAdvertisementOrder(advertisementId: string, newOrder: number): void {
    const adIndex = this.advertisements.findIndex(
      (ad) => ad.advertisementId === advertisementId
    );

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
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Deactivate loop
   */
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Update rotation type
   */
  updateRotationType(rotationType: RotationType): void {
    this.rotationType = rotationType;
    this.updatedAt = new Date();
  }

  /**
   * Update display layout
   */
  updateDisplayLayout(layout: DisplayLayout): void {
    this.displayLayout = layout;
    this.updatedAt = new Date();
  }

  /**
   * Get advertisement at specific order position
   */
  getAdvertisementAtPosition(position: number): LoopAdvertisementEntry | null {
    return this.advertisements.find((ad) => ad.order === position) ?? null;
  }

  /**
   * Get next advertisement based on rotation type
   * For sequential: returns next in order
   * For random: returns random advertisement
   * For weighted: returns based on weight
   */
  getNextAdvertisement(
    currentPosition?: number
  ): LoopAdvertisementEntry | null {
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
  private getNextSequential(
    currentPosition?: number
  ): LoopAdvertisementEntry | null {
    if (currentPosition === undefined) {
      return this.advertisements[0] ?? null;
    }

    const nextPosition = (currentPosition + 1) % this.advertisements.length;
    return this.advertisements[nextPosition] ?? null;
  }

  /**
   * Get random advertisement
   */
  private getNextRandom(): LoopAdvertisementEntry | null {
    const randomIndex = Math.floor(Math.random() * this.advertisements.length);
    return this.advertisements[randomIndex] ?? null;
  }

  /**
   * Get advertisement based on weighted distribution
   * Higher weight = higher probability of selection
   */
  private getNextWeighted(): LoopAdvertisementEntry | null {
    const totalWeight = this.advertisements.reduce(
      (sum, ad) => sum + ad.weight,
      0
    );

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
  static isValidLoopName(name: string): boolean {
    return name.length >= 3;
  }
}
