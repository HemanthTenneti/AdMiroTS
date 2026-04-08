import { Orientation } from "../enums";
/**
 * Display configuration value object
 * Contains device-specific settings
 * Immutable once created
 */
export class DisplayConfiguration {
    brightness;
    volume;
    refreshRate;
    orientation;
    constructor(config) {
        // Validate and set brightness (0-100)
        this.brightness = this.validateRange(config.brightness ?? 100, 0, 100, "Brightness");
        // Validate and set volume (0-100)
        this.volume = this.validateRange(config.volume ?? 50, 0, 100, "Volume");
        // Validate and set refresh rate (30-120 Hz)
        this.refreshRate = this.validateRange(config.refreshRate ?? 60, 30, 120, "Refresh rate");
        this.orientation = config.orientation ?? Orientation.LANDSCAPE;
    }
    validateRange(value, min, max, fieldName) {
        if (value < min || value > max) {
            throw new Error(`${fieldName} must be between ${min} and ${max}`);
        }
        return value;
    }
    /**
     * Create default configuration
     */
    static createDefault() {
        return new DisplayConfiguration({
            brightness: 100,
            volume: 50,
            refreshRate: 60,
            orientation: Orientation.LANDSCAPE
        });
    }
    /**
     * Create a modified copy with updated values
     */
    update(updates) {
        return new DisplayConfiguration({
            brightness: updates.brightness ?? this.brightness,
            volume: updates.volume ?? this.volume,
            refreshRate: updates.refreshRate ?? this.refreshRate,
            orientation: updates.orientation ?? this.orientation
        });
    }
}
