/**
 * Advertisement status lifecycle
 * Tracks the current state of an advertisement
 */
export var AdStatus;
(function (AdStatus) {
    AdStatus["ACTIVE"] = "active";
    AdStatus["SCHEDULED"] = "scheduled";
    AdStatus["PAUSED"] = "paused";
    AdStatus["EXPIRED"] = "expired";
    AdStatus["DRAFT"] = "draft";
})(AdStatus || (AdStatus = {}));
