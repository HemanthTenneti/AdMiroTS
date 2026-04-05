import { RotationType, DisplayLayout } from "../enums";
import { LoopAdvertisementEntry } from "../value-objects/LoopAdvertisementEntry";

/**
 * Display loop entity interface
 * Represents a playlist of advertisements assigned to a display
 */
export interface IDisplayLoop {
  id: string;
  loopId: string; // Auto-generated unique ID
  loopName: string;
  displayId: string; // FK to Display
  advertisements: LoopAdvertisementEntry[]; // Ordered list of ads
  rotationType: RotationType;
  displayLayout: DisplayLayout;
  totalDuration: number; // Sum of all ad durations in seconds
  isActive: boolean;
  description?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}
