import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import path from "path";
import { getEnv, isR2Configured } from "../../config/env";
import { ValidationError } from "../../utils/errors/ValidationError";

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 250 * 1024 * 1024;

type MediaKind = "image" | "video";

export interface UploadUrlInput {
  advertiserId: string;
  mediaType: MediaKind;
  mimeType: string;
  fileName: string;
  fileSize: number;
}

export interface UploadUrlResult {
  objectKey: string;
  uploadUrl: string;
  publicUrl: string;
  expiresIn: number;
}

export class R2StorageService {
  private readonly env = getEnv();
  private readonly enabled: boolean;
  private readonly client: S3Client | null;

  constructor() {
    this.enabled = isR2Configured(this.env);

    this.client = this.enabled
      ? new S3Client({
          region: "auto",
          endpoint: `https://${this.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: this.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: this.env.R2_SECRET_ACCESS_KEY!,
          },
        })
      : null;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public async createUploadUrl(input: UploadUrlInput): Promise<UploadUrlResult> {
    this.ensureEnabled();
    this.validateUploadInput(input);

    const extension = this.extractExtension(input.fileName, input.mimeType);
    const objectKey = `advertisements/${input.advertiserId}/${randomUUID()}.${extension}`;

    const putCommand = new PutObjectCommand({
      Bucket: this.env.R2_BUCKET_NAME!,
      Key: objectKey,
      ContentType: input.mimeType,
      ContentLength: input.fileSize,
    });

    const expiresIn = this.env.R2_UPLOAD_URL_TTL_SECONDS;
    const uploadUrl = await getSignedUrl(this.client!, putCommand, { expiresIn });

    const publicUrl = this.env.R2_PUBLIC_BASE_URL
      ? `${this.env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${objectKey}`
      : `https://${this.env.R2_BUCKET_NAME}.${this.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${objectKey}`;

    return {
      objectKey,
      uploadUrl,
      publicUrl,
      expiresIn,
    };
  }

  private ensureEnabled(): void {
    if (!this.enabled || !this.client) {
      throw new ValidationError("R2 is not configured. Set R2 credentials in environment variables.");
    }
  }

  private validateUploadInput(input: UploadUrlInput): void {
    if (input.fileSize <= 0) {
      throw new ValidationError("fileSize must be greater than 0");
    }

    const mime = input.mimeType.toLowerCase();

    if (input.mediaType === "image") {
      if (!IMAGE_MIME_TYPES.includes(mime)) {
        throw new ValidationError(`Unsupported image mimeType: ${input.mimeType}`);
      }
      if (input.fileSize > MAX_IMAGE_SIZE_BYTES) {
        throw new ValidationError("Image file exceeds maximum allowed size (10 MB)");
      }
      return;
    }

    if (!VIDEO_MIME_TYPES.includes(mime)) {
      throw new ValidationError(`Unsupported video mimeType: ${input.mimeType}`);
    }
    if (input.fileSize > MAX_VIDEO_SIZE_BYTES) {
      throw new ValidationError("Video file exceeds maximum allowed size (250 MB)");
    }
  }

  private extractExtension(fileName: string, mimeType: string): string {
    const cleaned = (fileName || "").trim();
    const parsedExtension = cleaned.includes(".") ? path.extname(cleaned).replace(".", "") : "";

    if (parsedExtension) {
      return parsedExtension.toLowerCase();
    }

    const mimeToExtension: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "video/mp4": "mp4",
      "video/webm": "webm",
      "video/quicktime": "mov",
    };

    return mimeToExtension[mimeType.toLowerCase()] ?? "bin";
  }
}

export default R2StorageService;
