/**
 * Advertisement Service
 * Handles business logic for advertisement operations
 * Implements single responsibility principle - only manages advertisement domain logic
 */
import { Advertisement, AdStatus, MediaType } from "@admiro/domain";
import { AdvertisementRepository } from "../../services/repositories/AdvertisementRepository";
import { NotFoundError } from "../../utils/errors/NotFoundError";
import { ValidationError } from "../../utils/errors/ValidationError";
import { Logger } from "../../utils/logger";
import { IdGenerator } from "../../utils/id-generator";

/**
 * Whitelist of allowed sort fields
 * Prevents NoSQL injection attacks through sort parameter
 * Only fields that exist in the database schema are allowed
 */
const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "adName",
  "views",
  "clicks",
  "duration",
] as const;

type AllowedSortField = typeof ALLOWED_SORT_FIELDS[number];

/**
 * Inbound data transfer object for creating advertisements
 * Separated from domain model to control input surface
 */
interface CreateAdvertisementInput {
  adName: string;
  mediaUrl: string;
  mediaType: MediaType;
  duration: number;
  description?: string | undefined;
  targetAudience?: string | undefined;
  fileSize?: number | undefined;
}

/**
 * Inbound data transfer object for updating advertisements
 * All fields optional - only provided fields are updated
 */
interface UpdateAdvertisementInput {
  adName?: string | undefined;
  mediaUrl?: string | undefined;
  mediaType?: MediaType | undefined;
  duration?: number | undefined;
  description?: string | undefined;
  targetAudience?: string | undefined;
  fileSize?: number | undefined;
}

/**
 * Query filters for listing advertisements
 * Applied to filter and sort database queries
 */
interface ListFilters {
  status?: string | undefined;
  mediaType?: string | undefined;
  advertiserId?: string | undefined;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
}

export class AdvertisementService {
  private adRepository: AdvertisementRepository;

  constructor() {
    // Instantiate repository with dependency injection
    // Repository pattern isolates database access logic
    this.adRepository = new AdvertisementRepository();
  }

  /**
   * Create a new advertisement
   * Generates unique IDs, sets initial status to DRAFT, initializes metrics
   *
   * @param advertiserId - ID of the user creating the advertisement
   * @param data - Advertisement input data
   * @returns Created Advertisement entity
   * @throws ValidationError if input is invalid
   */
  async createAdvertisement(
    advertiserId: string,
    data: CreateAdvertisementInput
  ): Promise<Advertisement> {
    const id = IdGenerator.adId();

    // Create domain entity with initial values
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
      status: AdStatus.DRAFT, // New ads start in draft status
      views: 0, // Initialize metrics
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Persist to database and return result
    const created = await this.adRepository.create(advertisement as any);
    Logger.info(`Advertisement created: ${id}`, { advertiserId });
    return created;
  }

  /**
   * Retrieve advertisement by ID
   * Verifies existence before returning to provide helpful error messages
   *
   * @param id - Advertisement ID
   * @returns Advertisement entity
   * @throws NotFoundError if advertisement doesn't exist
   */
  async getAdvertisement(id: string): Promise<Advertisement> {
    const ad = await this.adRepository.findById(id);
    if (!ad) {
      throw new NotFoundError(`Advertisement with ID ${id} not found`);
    }
    return ad;
  }

  /**
   * List advertisements with pagination and optional filters
   * Supports filtering by status, media type, advertiser, and custom sorting
   * Validates sortBy parameter against whitelist to prevent NoSQL injection
   *
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @param filters - Optional filters and sort configuration
   * @returns Paginated results with total count
   * @throws ValidationError if sortBy is not in whitelist
   */
  async listAdvertisements(
    page: number,
    limit: number,
    filters?: ListFilters
  ): Promise<{ data: Advertisement[]; total: number }> {
    // Build filter object from provided filters
    // Only include filters that are explicitly set (not undefined)
    const filterObj: Record<string, any> = {};

    if (filters?.status) filterObj.status = filters.status;
    if (filters?.mediaType) filterObj.mediaType = filters.mediaType;
    if (filters?.advertiserId) filterObj.advertiserId = filters.advertiserId;

    // Validate sortBy field against whitelist
    // This prevents NoSQL injection attacks through the sort parameter
    let validSortBy: AllowedSortField = "createdAt";
    if (filters?.sortBy && ALLOWED_SORT_FIELDS.includes(filters.sortBy as any)) {
      validSortBy = filters.sortBy as AllowedSortField;
    } else if (filters?.sortBy) {
      // Reject invalid sort fields to prevent injection
      throw new ValidationError(
        `Invalid sortBy field. Allowed fields: ${ALLOWED_SORT_FIELDS.join(", ")}`
      );
    }

    // Delegate pagination logic to repository
    // Repository handles skip/limit calculation and sorting
    const result = await this.adRepository.findWithPagination(
      filterObj,
      page,
      limit,
      validSortBy,
      filters?.sortOrder ?? "desc"
    );

    return result;
  }

  /**
   * Update an advertisement's mutable fields
   * Prevents updates to system fields like status (use dedicated methods instead)
   *
   * @param id - Advertisement ID
   * @param data - Partial update data
   * @returns Updated Advertisement entity
   * @throws NotFoundError if advertisement doesn't exist
   */
  async updateAdvertisement(id: string, data: UpdateAdvertisementInput): Promise<Advertisement> {
    // Verify advertisement exists before attempting update
    await this.getAdvertisement(id);

    // Build update object with only changed fields
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

    // Persist changes
    const updated = await this.adRepository.updateById(id, updateData);
    if (!updated) {
      throw new NotFoundError(`Advertisement with ID ${id} not found`);
    }

    Logger.info(`Advertisement updated: ${id}`);
    return updated;
  }

  /**
   * Soft delete an advertisement
   * Sets status to EXPIRED instead of removing record
   * Preserves historical data while removing from active lists
   *
   * @param id - Advertisement ID
   * @throws NotFoundError if advertisement doesn't exist
   */
  async deleteAdvertisement(id: string): Promise<void> {
    // Verify exists before attempting delete
    await this.getAdvertisement(id);

    // Soft delete - preserve data by marking as expired
    await this.adRepository.updateById(id, {
      status: AdStatus.EXPIRED,
      updatedAt: new Date(),
    });

    Logger.info(`Advertisement soft-deleted: ${id}`);
  }

  /**
   * Activate an advertisement
   * Changes status to ACTIVE, making it available for display
   *
   * @param id - Advertisement ID
   * @returns Updated Advertisement entity
   * @throws NotFoundError if advertisement doesn't exist
   */
  async activateAdvertisement(id: string): Promise<Advertisement> {
    // Verify exists before attempting status change
    await this.getAdvertisement(id);

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

  /**
   * Deactivate an advertisement
   * Changes status to PAUSED, preventing display without deletion
   *
   * @param id - Advertisement ID
   * @returns Updated Advertisement entity
   * @throws NotFoundError if advertisement doesn't exist
   */
  async deactivateAdvertisement(id: string): Promise<Advertisement> {
    // Verify exists before attempting status change
    await this.getAdvertisement(id);

    const updated = await this.adRepository.updateById(id, {
      status: AdStatus.PAUSED,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundError(`Advertisement with ID ${id} not found`);
    }

    Logger.info(`Advertisement deactivated: ${id}`);
    return updated;
  }

  /**
   * Get engagement statistics for an advertisement
   * Calculates derived metrics like CTR (click-through rate)
   *
   * @param id - Advertisement ID
   * @returns Statistics object with views, clicks, CTR percentage
   * @throws NotFoundError if advertisement doesn't exist
   */
  async getAdvertisementStats(id: string): Promise<{
    id: string;
    adName: string;
    views: number;
    clicks: number;
    clickThroughRate: number;
    displayCount: number;
  }> {
    const ad = await this.getAdvertisement(id);

    // Calculate CTR as percentage (safe division when views = 0)
    const ctr = ad.views > 0 ? (ad.clicks / ad.views) * 100 : 0;

    return {
      id: ad.id,
      adName: ad.adName,
      views: ad.views,
      clicks: ad.clicks,
      clickThroughRate: parseFloat(ctr.toFixed(2)), // Round to 2 decimal places
      displayCount: 0, // TODO: Calculate from display loop entries
    };
  }

  /**
   * Get all advertisements created by a specific user
   * Used to show user's own advertisement portfolio
   *
   * @param userId - User/advertiser ID
   * @returns Array of advertisements created by this user
   */
  async getAdvertisementsByUser(userId: string): Promise<Advertisement[]> {
    return this.adRepository.findByAdvertiserId(userId);
  }

  /**
   * Bulk create multiple advertisements in a single request
   * Iteratively creates each advertisement to ensure proper error handling
   *
   * @param advertiserId - ID of the user creating advertisements
   * @param advertisements - Array of advertisement input data
   * @returns Array of created Advertisement entities
   */
  async bulkCreateAdvertisements(
    advertiserId: string,
    advertisements: CreateAdvertisementInput[]
  ): Promise<Advertisement[]> {
    const created: Advertisement[] = [];

    // Create each advertisement sequentially
    // This ensures proper error handling per item
    for (const ad of advertisements) {
      const createdAd = await this.createAdvertisement(advertiserId, ad);
      created.push(createdAd);
    }

    Logger.info(`Bulk created ${created.length} advertisements for user ${advertiserId}`);
    return created;
  }
}

export default AdvertisementService;
