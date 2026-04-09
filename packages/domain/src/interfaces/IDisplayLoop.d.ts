import { RotationType, DisplayLayout } from "../enums";
import { LoopAdvertisementEntry } from "../value-objects/LoopAdvertisementEntry";
/**
 * Display loop entity interface
 * Represents a playlist of advertisements assigned to a display
 */
export interface IDisplayLoop {
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
}
//# sourceMappingURL=IDisplayLoop.d.ts.map