/**
 * Base repository class providing standard CRUD operations
 * All entity repositories inherit from this to ensure consistency
 *
 * Generic T represents the domain entity type that will be returned from operations.
 * The Model<any> is kept loose because Mongoose Document type conflicts with our
 * domain entity classes. In a greenfield project, we would separate database documents
 * (IUserDocument, IAdvertisementDocument) from domain entities (User, Advertisement).
 * For now, we maintain type safety at the service layer while allowing repositories
 * to bridge between persistence and domain concerns safely.
 */
import type { Model, Document } from "mongoose";

export abstract class BaseRepository<T = Record<string, any>> {
  constructor(protected model: Model<any>) {}

  async findById(id: string): Promise<T | null> {
    return this.model.findOne({ id });
  }

  async findOne(filter: Record<string, any>): Promise<T | null> {
    return this.model.findOne(filter);
  }

  async find(filter: Record<string, any> = {}): Promise<T[]> {
    return this.model.find(filter);
  }

  async findWithPagination(
    filter: Record<string, any>,
    page: number,
    limit: number,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<{ data: T[]; total: number }> {
    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sortOption: Record<string, 1 | -1> = {};
    sortOption[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query and count in parallel
    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sortOption).skip(skip).limit(limit),
      this.model.countDocuments(filter),
    ]);

    return { data, total };
  }

  async create(data: Record<string, any>): Promise<T> {
    // Mongoose create returns the persisted document; we convert to domain entity
    // at the repository level if needed, or leave as-is if DB model matches domain
    return this.model.create(data);
  }

  async updateById(id: string, data: Record<string, any>): Promise<T | null> {
    return this.model.findOneAndUpdate({ id }, data, { new: true });
  }

  async deleteById(id: string): Promise<T | null> {
    return this.model.findOneAndDelete({ id });
  }

  async count(filter: Record<string, any> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }
}

export default BaseRepository;
