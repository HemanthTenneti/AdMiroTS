/**
 * Advertisement rotation strategy within a display loop
 * Determines the order in which ads are played
 */
export var RotationType;
(function (RotationType) {
    RotationType["SEQUENTIAL"] = "sequential";
    RotationType["RANDOM"] = "random";
    RotationType["WEIGHTED"] = "weighted";
})(RotationType || (RotationType = {}));
