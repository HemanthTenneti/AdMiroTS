/**
 * Advertisement status lifecycle
 * Tracks the current state of an advertisement
 */
export enum AdStatus {
  ACTIVE = "active",
  SCHEDULED = "scheduled",
  PAUSED = "paused",
  EXPIRED = "expired",
  DRAFT = "draft"
}
