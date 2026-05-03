/**
 * Display Loop Service
 * Handles business logic for display loop operations
 */
import { DisplayLoop, RotationType, DisplayLayout, LoopAdvertisementEntry } from "@admiro/domain";
import { DisplayLoopRepository } from "../../services/repositories/DisplayLoopRepository";
import { NotFoundError } from "../../utils/errors/NotFoundError";
import { ValidationError } from "../../utils/errors/ValidationError";
import { Logger } from "../../utils/logger";
import { IdGenerator } from "../../utils/id-generator";
import { CreateDisplayLoopInput, UpdateDisplayLoopInput, AddAdvertisementToLoopInput } from "./display-loops.types";

const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "loopName", "totalDuration"] as const;

export class DisplayLoopService {
  private loopRepository: DisplayLoopRepository;

  constructor() {
    this.loopRepository = new DisplayLoopRepository();
  }

  /**
   * Create a new display loop
   */
  async createLoop(data: CreateDisplayLoopInput): Promise<DisplayLoop> {
    const id = IdGenerator.loopId();

    const loop = new DisplayLoop({
      id,
      loopId: id,
      loopName: data.loopName,
      displayId: data.displayId,
      advertisements: [],
      rotationType: data.rotationType,
      displayLayout: data.displayLayout,
      totalDuration: 0,
      isActive: true,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await this.loopRepository.create(loop as any);
    Logger.info(`Display loop created: ${id}`, { displayId: data.displayId });
    return created;
  }

  /**
   * Get loop by ID
   */
  async getLoop(id: string): Promise<DisplayLoop> {
    const loop = await this.loopRepository.findById(id);
    if (!loop) {
      throw new NotFoundError(`Display loop with ID ${id} not found`);
    }
    return loop;
  }

  /**
   * List display loops with pagination
   */
  async listLoops(
    page: number,
    limit: number,
    filters?: { displayId?: string; isActive?: boolean; sortBy?: string; sortOrder?: "asc" | "desc" }
  ): Promise<{ data: DisplayLoop[]; total: number }> {
    const filterObj: Record<string, any> = {};
    if (filters?.displayId) filterObj.displayId = filters.displayId;
    if (filters?.isActive !== undefined) filterObj.isActive = filters.isActive;

    let sortBy = "createdAt";
    if (filters?.sortBy && ALLOWED_SORT_FIELDS.includes(filters.sortBy as any)) {
      sortBy = filters.sortBy;
    }

    return this.loopRepository.findWithPagination(
      filterObj,
      page,
      limit,
      sortBy as any,
      filters?.sortOrder ?? "desc"
    );
  }

  /**
   * Update display loop
   */
  async updateLoop(id: string, data: UpdateDisplayLoopInput): Promise<DisplayLoop> {
    const loop = await this.getLoop(id);

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.loopName !== undefined) updateData.loopName = data.loopName;
    if (data.rotationType !== undefined) updateData.rotationType = data.rotationType;
    if (data.displayLayout !== undefined) updateData.displayLayout = data.displayLayout;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.description !== undefined) updateData.description = data.description;

    const updated = await this.loopRepository.updateById(id, updateData);
    if (!updated) {
      throw new NotFoundError(`Display loop with ID ${id} not found`);
    }

    Logger.info(`Display loop updated: ${id}`);
    return updated;
  }

  /**
   * Delete display loop
   */
  async deleteLoop(id: string): Promise<void> {
    await this.getLoop(id);
    await this.loopRepository.deleteById(id);
    Logger.info(`Display loop deleted: ${id}`);
  }

  /**
   * Add advertisement to loop
   */
  async addAdvertisement(loopId: string, data: AddAdvertisementToLoopInput): Promise<DisplayLoop> {
    const loop = await this.getLoop(loopId);
    
    // In a real app, we'd verify the advertisement exists here
    
    const entry = new LoopAdvertisementEntry(
      data.advertisementId,
      data.order,
      data.duration,
      data.weight ?? 1
    );

    loop.addAdvertisement(entry);

    const updated = await this.loopRepository.updateById(loopId, {
      advertisements: loop.advertisements,
      totalDuration: loop.totalDuration,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundError(`Display loop with ID ${loopId} not found`);
    }

    Logger.info(`Advertisement ${data.advertisementId} added to loop ${loopId}`);
    return updated;
  }

  /**
   * Remove advertisement from loop
   */
  async removeAdvertisement(loopId: string, advertisementId: string): Promise<DisplayLoop> {
    const loop = await this.getLoop(loopId);
    
    loop.removeAdvertisement(advertisementId);

    const updated = await this.loopRepository.updateById(loopId, {
      advertisements: loop.advertisements,
      totalDuration: loop.totalDuration,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundError(`Display loop with ID ${loopId} not found`);
    }

    Logger.info(`Advertisement ${advertisementId} removed from loop ${loopId}`);
    return updated;
  }

  /**
   * Update advertisement order in loop
   */
  async updateAdvertisementOrder(
    loopId: string,
    advertisementId: string,
    newOrder: number
  ): Promise<DisplayLoop> {
    const loop = await this.getLoop(loopId);
    
    try {
      loop.updateAdvertisementOrder(advertisementId, newOrder);
    } catch (error: any) {
      throw new ValidationError(error.message);
    }

    const updated = await this.loopRepository.updateById(loopId, {
      advertisements: loop.advertisements,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundError(`Display loop with ID ${loopId} not found`);
    }

    Logger.info(`Order updated for advertisement ${advertisementId} in loop ${loopId}`);
    return updated;
  }
}

export default DisplayLoopService;
