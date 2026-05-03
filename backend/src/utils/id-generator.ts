/**
 * ID Generator utility for creating unique identifiers
 */
import { randomUUID } from "crypto";

export class IdGenerator {
  // Generate UUID v4
  static uuid(): string {
    return randomUUID();
  }

  // Generate prefixed ID (e.g., user_abc123)
  static prefixed(prefix: string): string {
    return `${prefix}_${randomUUID().replace(/-/g, "").substring(0, 12)}`;
  }

  static userId(): string {
    return this.prefixed("user");
  }

  // MongoDB schema validates adId as "AD-{UUID}" format
  static adId(): string {
    return `AD-${randomUUID()}`;
  }

  static displayId(): string {
    return this.prefixed("disp");
  }

  static loopId(): string {
    return this.prefixed("loop");
  }

  static logId(): string {
    return this.prefixed("log");
  }

  static analyticsId(): string {
    return this.prefixed("ana");
  }

  static connectionRequestId(): string {
    return this.prefixed("connreq");
  }
}
