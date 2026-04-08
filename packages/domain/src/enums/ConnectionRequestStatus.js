/**
 * Display connection request status
 * Tracks the approval workflow for new display registrations
 */
export var ConnectionRequestStatus;
(function (ConnectionRequestStatus) {
    ConnectionRequestStatus["PENDING"] = "pending";
    ConnectionRequestStatus["APPROVED"] = "approved";
    ConnectionRequestStatus["REJECTED"] = "rejected";
})(ConnectionRequestStatus || (ConnectionRequestStatus = {}));
