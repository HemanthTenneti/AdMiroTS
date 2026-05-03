import { expect } from "chai";
import { AnalyticsValidationSchemas } from "./analytics.validation";

describe("AnalyticsValidationSchemas", () => {
  it("accepts default list query", () => {
    const parsed = AnalyticsValidationSchemas.list.parse({});

    expect(parsed.page).to.equal(1);
    expect(parsed.limit).to.equal(10);
    expect(parsed.sortBy).to.equal("timestamp");
    expect(parsed.sortOrder).to.equal("desc");
  });

  it("coerces numeric list query strings", () => {
    const parsed = AnalyticsValidationSchemas.list.parse({
      page: "2",
      limit: "25",
    });

    expect(parsed.page).to.equal(2);
    expect(parsed.limit).to.equal(25);
  });

  it("rejects invalid sort order", () => {
    expect(() => AnalyticsValidationSchemas.list.parse({ sortOrder: "newest" })).to.throw();
  });

  it("rejects invalid dates", () => {
    expect(() => AnalyticsValidationSchemas.list.parse({ startDate: "not-a-date" })).to.throw();
    expect(() => AnalyticsValidationSchemas.list.parse({ endDate: "2026-99-99" })).to.throw();
  });
});
