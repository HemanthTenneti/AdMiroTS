import { Orientation } from "../enums";

/**
 * Display configuration value object
 * Contains device-specific settings
 * Immutable once created
 */
export class DisplayConfiguration {
  public readonly brightness: number;
  public readonly volume: number;
  public readonly refreshRate: number;
  public readonly orientation: Orientation;

  constructor(config: {
    brightness?: number;
    volume?: number;
    refreshRate?: number;
    orientation?: Orientation;
  }) {
    // Validate and set brightness (0-100)
    this.brightness = this.validateRange(
      config.brightness ?? 100,
      0,
      100,
      "Brightness"
    );

    // Validate and set volume (0-100)
    this.volume = this.validateRange(
      config.volume ?? 50,
      0,
      100,
      "Volume"
    );

    // Validate and set refresh rate (30-120 Hz)
    this.refreshRate = this.validateRange(
      config.refreshRate ?? 60,
      30,
      120,
      "Refresh rate"
    );

    this.orientation = config.orientation ?? Orientation.LANDSCAPE;
  }

  private validateRange(
    value: number,
    min: number,
    max: number,
    fieldName: string
  ): number {
    if (value < min || value > max) {
      throw new Error(`${fieldName} must be between ${min} and ${max}`);
    }
    return value;
  }

  /**
   * Create default configuration
   */
  static createDefault(): DisplayConfiguration {
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
  update(updates: {
    brightness?: number;
    volume?: number;
    refreshRate?: number;
    orientation?: Orientation;
  }): DisplayConfiguration {
    return new DisplayConfiguration({
      brightness: updates.brightness ?? this.brightness,
      volume: updates.volume ?? this.volume,
      refreshRate: updates.refreshRate ?? this.refreshRate,
      orientation: updates.orientation ?? this.orientation
    });
  }
}
