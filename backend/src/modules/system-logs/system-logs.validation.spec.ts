import { expect } from "chai";
import { EntityType, LogAction } from "@admiro/domain";
import { SystemLogValidationSchemas } from "./system-logs.validation";

describe("SystemLogValidationSchemas", () => {
  it("accepts default list query", () => {
    const parsed = SystemLogValidationSchemas.list.parse({});

    expect(parsed.page).to.equal(1);
    expect(parsed.limit).to.equal(10);
    expect(parsed.sortBy).to.equal("createdAt");
    expect(parsed.sortOrder).to.equal("desc");
  });

  it("coerces numeric list query strings", () => {
    const parsed = SystemLogValidationSchemas.list.parse({
      page: "3",
      limit: "50",
    });

    expect(parsed.page).to.equal(3);
    expect(parsed.limit).to.equal(50);
  });

  it("rejects invalid sort order", () => {
    expect(() => SystemLogValidationSchemas.list.parse({ sortOrder: "newest" })).to.throw();
  });

  it("rejects invalid enum filters", () => {
    expect(() => SystemLogValidationSchemas.list.parse({ action: "login" })).to.throw();
    expect(() => SystemLogValidationSchemas.list.parse({ entityType: "campaign" })).to.throw();
  });

  it("accepts all log action enum values", () => {
    for (const action of Object.values(LogAction)) {
      const parsed = SystemLogValidationSchemas.list.parse({
        action,
        entityType: EntityType.SYSTEM,
      });

      expect(parsed.action).to.equal(action);
    }
  });

  it("rejects invalid dates", () => {
    expect(() => SystemLogValidationSchemas.list.parse({ startDate: "not-a-date" })).to.throw();
    expect(() => SystemLogValidationSchemas.list.parse({ endDate: "2026-99-99" })).to.throw();
  });
});
