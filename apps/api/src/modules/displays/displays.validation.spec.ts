import { expect } from "chai";
import { DisplayValidationSchemas } from "./displays.validation";

describe("DisplayValidationSchemas", () => {
  it("accepts login payload", () => {
    const parsed = DisplayValidationSchemas.loginDisplay.parse({
      displayId: "DISP-001",
      password: "secret123",
    });

    expect(parsed.displayId).to.equal("DISP-001");
  });

  it("rejects invalid register-self payload", () => {
    expect(() =>
      DisplayValidationSchemas.registerSelf.parse({
        displayName: "A",
        location: "X",
        resolution: { width: 0, height: 1080 },
      })
    ).to.throw();
  });
});
