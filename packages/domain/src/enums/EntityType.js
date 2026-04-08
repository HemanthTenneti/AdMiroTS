/**
 * Entity types in the system
 * Used for logging and auditing to identify which resource was affected
 */
export var EntityType;
(function (EntityType) {
    EntityType["DISPLAY"] = "display";
    EntityType["ADVERTISEMENT"] = "advertisement";
    EntityType["LOOP"] = "loop";
    EntityType["USER"] = "user";
    EntityType["SYSTEM"] = "system";
})(EntityType || (EntityType = {}));
