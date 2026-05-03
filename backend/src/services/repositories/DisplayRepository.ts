/**
 * Display Repository
 * Handles all database operations for Display entities
 */
import { BaseRepository } from "../base/BaseRepository";
import { IDisplay, Display } from "@admiro/domain";
import { DisplayModel } from "../../config/db";

export class DisplayRepository extends BaseRepository<Display> {
  constructor() {
    super(DisplayModel);
  }

  async findByLocation(location: string): Promise<Display[]> {
    const docs = await this.model.find({ location });
    return docs.map((doc: any) => new Display(doc.toObject() as IDisplay));
  }

  async findByStatus(status: string): Promise<Display[]> {
    const docs = await this.model.find({ status });
    return docs.map((doc: any) => new Display(doc.toObject() as IDisplay));
  }

  async findByLayout(layout: string): Promise<Display[]> {
    const docs = await this.model.find({ layout });
    return docs.map((doc: any) => new Display(doc.toObject() as IDisplay));
  }

  async updateLastPing(id: string): Promise<void> {
    // Update lastSeen timestamp (when display last communicated with server)
    await this.model.findOneAndUpdate({ id }, { lastSeen: new Date() });
  }

  /**
   * Find display by its displayId (used during pairing flow)
   * Note: The pairing flow passes the displayId as the lookup key.
   * This is intentionally querying displayId, not a separate serialNumber field.
   */
  async findByDisplayId(displayId: string): Promise<Display | null> {
    const doc = await this.model.findOne({ displayId });
    if (!doc) return null;
    return new Display(doc.toObject() as IDisplay);
  }

  async findByConnectionToken(token: string): Promise<Display | null> {
    const doc = await this.model.findOne({ connectionToken: token });
    if (!doc) return null;
    return new Display(doc.toObject() as IDisplay);
  }

  async findByDisplayIds(displayIds: string[]): Promise<Display[]> {
    if (displayIds.length === 0) return [];
    const docs = await this.model.find({ id: { $in: displayIds } });
    return docs.map((doc: any) => new Display(doc.toObject() as IDisplay));
  }
}

export default DisplayRepository;
