/**
 * System log action types
 * Tracks what operation was performed
 */
export var LogAction;
(function (LogAction) {
    LogAction["CREATE"] = "create";
    LogAction["UPDATE"] = "update";
    LogAction["DELETE"] = "delete";
    LogAction["STATUS_CHANGE"] = "status_change";
    LogAction["APPROVE"] = "approve";
    LogAction["REJECT"] = "reject";
    LogAction["OTHER"] = "other";
})(LogAction || (LogAction = {}));
