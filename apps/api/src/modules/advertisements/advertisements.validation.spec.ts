import { expect } from "chai";
import { AdvertisementValidationSchemas } from "./advertisements.validation";

describe("AdvertisementValidationSchemas", () => {
  it("accepts upload-url request", () => {
    const parsed = AdvertisementValidationSchemas.createUploadUrl.parse({
      mediaType: "image",
      mimeType: "image/png",
      fileName: "banner.png",
      fileSize: 1024,
    });

    expect(parsed.mediaType).to.equal("image");
  });

  it("rejects create payload with invalid media type", () => {
    expect(() =>
      AdvertisementValidationSchemas.create.parse({
        adName: "Launch",
        mediaUrl: "https://cdn.example.com/video.mov",
        mediaType: "gif",
        duration: 30,
      })
    ).to.throw();
  });
});
