import { Orientation } from "../enums";
/**
 * Display configuration value object
 * Contains device-specific settings
 * Immutable once created
 */
export declare class DisplayConfiguration {
    readonly brightness: number;
    readonly volume: number;
    readonly refreshRate: number;
    readonly orientation: Orientation;
    constructor(config: {
        brightness?: number;
        volume?: number;
        refreshRate?: number;
        orientation?: Orientation;
    });
    private validateRange;
    /**
     * Create default configuration
     */
    static createDefault(): DisplayConfiguration;
    /**
     * Create a modified copy with updated values
     */
    update(updates: {
        brightness?: number;
        volume?: number;
        refreshRate?: number;
        orientation?: Orientation;
    }): DisplayConfiguration;
}
//# sourceMappingURL=DisplayConfiguration.d.ts.map