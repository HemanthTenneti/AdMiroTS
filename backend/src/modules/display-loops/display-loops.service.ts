/**
 * Display Loop Service
 * Handles business logic for display loop operations
 */
import { DisplayLoop, RotationType, DisplayLayout, LoopAdvertisementEntry } from "@admiro/domain";
import { DisplayLoopRepository } from "../../services/repositories/DisplayLoopRepository";
import { DisplayRepository } from "../../services/repositories/DisplayRepository";
import { NotFoundError } from "../../utils/errors/NotFoundError";
import { ValidationError } from "../../utils/errors/ValidationError";
import { Logger } from "../../utils/logger";
import { IdGenerator } from "../../utils/id-generator";
import {
  CreateDisplayLoopInput,
  UpdateDisplayLoopInput,
  AddAdvertisementToLoopInput,
  AddDisplayToLoopInput,
} from "./display-loops.types";

const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "loopName", "totalDuration"] as const;

export class DisplayLoopService {
  private loopRepository: DisplayLoopRepository;
  private displayRepository: DisplayRepository;

  constructor() {
    this.loopRepository = new DisplayLoopRepository();
    this.displayRepository = new DisplayRepository();
  }

  private normalizeDisplayIds(data: Pick<CreateDisplayLoopInput, "displayId" | "displayIds">): string[] {
    const fromArray = Array.isArray(data.displayIds) ? data.displayIds : [];
    const merged = [...fromArray, data.displayId ?? ""]
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    return Array.from(new Set(merged));
  }

  private async validateDisplayIds(displayIds: string[]): Promise<void> {
    if (displayIds.length === 0) return;
    const displays = await this.displayRepository.findByDisplayIds(displayIds);
    const existingIds = new Set(displays.map((display) => display.id));
    const missingIds = displayIds.filter((id) => !existingIds.has(id));
    if (missingIds.length > 0) {
      throw new ValidationError(`Invalid display IDs: ${missingIds.join(", ")}`);
    }
  }

  /**
   * Create a new display loop
   */
  async createLoop(data: CreateDisplayLoopInput): Promise<DisplayLoop> {
    const id = IdGenerator.loopId();
    const displayIds = this.normalizeDisplayIds(data);
    await this.validateDisplayIds(displayIds);

    const loop = new DisplayLoop({
      id,
      loopId: id,
      loopName: data.loopName,
      displayId: displayIds[0] ?? "",
      displayIds,
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
    Logger.info(`Display loop created: ${id}`, { displayIds });
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
    if (filters?.displayId) {
      filterObj.$or = [{ displayIds: filters.displayId }, { displayId: filters.displayId }];
    }
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
   * Assign loop to an additional display
   */
  async addDisplay(loopId: string, data: AddDisplayToLoopInput): Promise<DisplayLoop> {
    const loop = await this.getLoop(loopId);
    const display = await this.displayRepository.findById(data.displayId);
    if (!display) {
      throw new ValidationError(`Display with ID ${data.displayId} not found`);
    }
    const nextDisplayIds = Array.from(
      new Set([...(Array.isArray(loop.displayIds) ? loop.displayIds : []), data.displayId])
    );

    const updated = await this.loopRepository.updateById(loopId, {
      displayIds: nextDisplayIds,
      displayId: nextDisplayIds[0] ?? "",
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundError(`Display loop with ID ${loopId} not found`);
    }

    Logger.info(`Display ${data.displayId} assigned to loop ${loopId}`);
    return updated;
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
