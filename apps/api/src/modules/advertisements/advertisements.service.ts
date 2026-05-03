/**
 * Advertisement Service
 */
import { Advertisement, AdStatus, MediaType } from "@admiro/domain";
import { AdvertisementRepository } from "../../services/repositories/AdvertisementRepository";
import { NotFoundError } from "../../utils/errors/NotFoundError";
import { ValidationError } from "../../utils/errors/ValidationError";
import { ForbiddenError } from "../../utils/errors/ForbiddenError";
import { Logger } from "../../utils/logger";
import { IdGenerator } from "../../utils/id-generator";
import { R2StorageService, UploadUrlResult } from "../../services/storage/R2StorageService";

const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "adName", "views", "clicks", "duration"] as const;
type AllowedSortField = (typeof ALLOWED_SORT_FIELDS)[number];

interface CreateAdvertisementInput {
  adName: string;
  mediaUrl: string;
  mediaType: MediaType;
  duration: number;
  description?: string;
  targetAudience?: string;
  fileSize?: number;
  mediaObjectKey?: string;
}

interface UpdateAdvertisementInput {
  adName?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  duration?: number;
  description?: string;
  targetAudience?: string;
  fileSize?: number;
  mediaObjectKey?: string;
}

interface ListFilters {
  status?: string;
  mediaType?: string;
  advertiserId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class AdvertisementService {
  private readonly adRepository: AdvertisementRepository;
  private readonly storageService: R2StorageService;

  constructor() {
    this.adRepository = new AdvertisementRepository();
    this.storageService = new R2StorageService();
  }

  async createUploadUrl(input: {
    advertiserId: string;
    mediaType: "image" | "video";
    mimeType: string;
    fileName: string;
    fileSize: number;
  }): Promise<UploadUrlResult> {
    return this.storageService.createUploadUrl(input);
  }

  async createAdvertisement(advertiserId: string, data: CreateAdvertisementInput): Promise<Advertisement> {
    const id = IdGenerator.adId();

    const advertisement = new Advertisement({
      id,
      adId: id,
      advertiserId,
      adName: data.adName,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      duration: data.duration,
      description: data.description ?? undefined,
      targetAudience: data.targetAudience ?? undefined,
      fileSize: data.fileSize ?? undefined,
      status: AdStatus.DRAFT,
      views: 0,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await this.adRepository.create({
      ...(advertisement as any),
      mediaObjectKey: data.mediaObjectKey,
    });

    Logger.info(`Advertisement created: ${id}`, { advertiserId });
    return created;
  }

  async getAdvertisement(id: string): Promise<Advertisement> {
    const ad = await this.adRepository.findById(id);
    if (!ad) {
      throw new NotFoundError(`Advertisement with ID ${id} not found`);
    }
    return ad;
  }

  async listAdvertisements(page: number, limit: number, filters?: ListFilters): Promise<{ data: Advertisement[]; total: number }> {
    const filterObj: Record<string, any> = {};

    if (filters?.status) filterObj.status = filters.status;
    if (filters?.mediaType) filterObj.mediaType = filters.mediaType;
    if (filters?.advertiserId) filterObj.advertiserId = filters.advertiserId;

    let validSortBy: AllowedSortField = "createdAt";
    if (filters?.sortBy && ALLOWED_SORT_FIELDS.includes(filters.sortBy as any)) {
      validSortBy = filters.sortBy as AllowedSortField;
    } else if (filters?.sortBy) {
      throw new ValidationError(`Invalid sortBy field. Allowed fields: ${ALLOWED_SORT_FIELDS.join(", ")}`);
    }

    return this.adRepository.findWithPagination(
      filterObj,
      page,
      limit,
      validSortBy,
      filters?.sortOrder ?? "desc"
    );
  }

  async updateAdvertisement(id: string, advertiserId: string, data: UpdateAdvertisementInput): Promise<Advertisement> {
    const ad = await this.getAdvertisement(id);

    if (ad.advertiserId !== advertiserId) {
      throw new ForbiddenError("You do not have permission to update this advertisement");
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.adName !== undefined) updateData.adName = data.adName;
    if (data.mediaUrl !== undefined) updateData.mediaUrl = data.mediaUrl;
    if (data.mediaType !== undefined) updateData.mediaType = data.mediaType;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.targetAudience !== undefined) updateData.targetAudience = data.targetAudience;
    if (data.fileSize !== undefined) updateData.fileSize = data.fileSize;
    if (data.mediaObjectKey !== undefined) updateData.mediaObjectKey = data.mediaObjectKey;

    const updated = await this.adRepository.updateById(id, updateData);
    if (!updated) {
      throw new NotFoundError(`Advertisement with ID ${id} not found`);
    }

    Logger.info(`Advertisement updated: ${id}`, { updatedBy: advertiserId });
    return updated;
  }

  async deleteAdvertisement(id: string, advertiserId: string): Promise<void> {
    const ad = await this.getAdvertisement(id);

    if (ad.advertiserId !== advertiserId) {
      throw new ForbiddenError("You do not have permission to delete this advertisement");
    }

    await this.adRepository.updateById(id, {
      status: AdStatus.EXPIRED,
      updatedAt: new Date(),
    });

    Logger.info(`Advertisement soft-deleted: ${id}`, { deletedBy: advertiserId });
  }

  async activateAdvertisement(id: string, advertiserId: string): Promise<Advertisement> {
    const ad = await this.getAdvertisement(id);

    if (ad.advertiserId !== advertiserId) {
      throw new ForbiddenError("You do not have permission to activate this advertisement");
    }

    const updated = await this.adRepository.updateById(id, {
      status: AdStatus.ACTIVE,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundError(`Advertisement with ID ${id} not found`);
    }

    Logger.info(`Advertisement activated: ${id}`);
    return updated;
  }

  async deactivateAdvertisement(id: string, advertiserId: string): Promise<Advertisement> {
    const ad = await this.getAdvertisement(id);

    if (ad.advertiserId !== advertiserId) {
      throw new ForbiddenError("You do not have permission to deactivate this advertisement");
    }

    const updated = await this.adRepository.updateById(id, {
      status: AdStatus.PAUSED,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundError(`Advertisement with ID ${id} not found`);
    }

    Logger.info(`Advertisement deactivated: ${id}`, { deactivatedBy: advertiserId });
    return updated;
  }

  async getAdvertisementStats(id: string): Promise<{
    id: string;
    adName: string;
    views: number;
    clicks: number;
    clickThroughRate: number;
    displayCount: number;
  }> {
    const ad = await this.getAdvertisement(id);

    const ctr = ad.views > 0 ? (ad.clicks / ad.views) * 100 : 0;

    return {
      id: ad.id,
      adName: ad.adName,
      views: ad.views,
      clicks: ad.clicks,
      clickThroughRate: Number(ctr.toFixed(2)),
      displayCount: 0,
    };
  }

  async getAdvertisementsByUser(userId: string): Promise<Advertisement[]> {
    return this.adRepository.findByAdvertiserId(userId);
  }

  async bulkCreateAdvertisements(advertiserId: string, advertisements: CreateAdvertisementInput[]): Promise<Advertisement[]> {
    const created: Advertisement[] = [];

    for (const ad of advertisements) {
      const createdAd = await this.createAdvertisement(advertiserId, ad);
      created.push(createdAd);
    }

    Logger.info(`Bulk created ${created.length} advertisements for user ${advertiserId}`);
    return created;
  }
}

export default AdvertisementService;
