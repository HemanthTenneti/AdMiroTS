/**
 * Display device status
 * Tracks the current operational state of a display
 */
export var DisplayStatus;
(function (DisplayStatus) {
    DisplayStatus["ONLINE"] = "online";
    DisplayStatus["OFFLINE"] = "offline";
    DisplayStatus["INACTIVE"] = "inactive";
})(DisplayStatus || (DisplayStatus = {}));
