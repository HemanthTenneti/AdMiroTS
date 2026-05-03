/**
 * Advertisement Repository
 * Handles all database operations for Advertisement entities
 */
import { BaseRepository } from "../base/BaseRepository";
import { IAdvertisement, Advertisement } from "@admiro/domain";
import { AdvertisementModel } from "../../config/db";

export class AdvertisementRepository extends BaseRepository<Advertisement> {
  constructor() {
    super(AdvertisementModel);
  }

  async findByAdvertiserId(advertiserId: string): Promise<Advertisement[]> {
    const docs = await this.model.find({ advertiserId });
    return docs.map((doc: any) => new Advertisement(doc.toObject() as IAdvertisement));
  }

  async findByStatus(status: string): Promise<Advertisement[]> {
    const docs = await this.model.find({ status });
    return docs.map((doc: any) => new Advertisement(doc.toObject() as IAdvertisement));
  }

  async findActive(): Promise<Advertisement[]> {
    const docs = await this.model.find({ status: "ACTIVE" });
    return docs.map((doc: any) => new Advertisement(doc.toObject() as IAdvertisement));
  }

  async incrementViews(id: string): Promise<void> {
    await this.model.findOneAndUpdate({ id }, { $inc: { views: 1 } });
  }

  async incrementClicks(id: string): Promise<void> {
    await this.model.findOneAndUpdate({ id }, { $inc: { clicks: 1 } });
  }

  async findByAnyIds(ids: string[]): Promise<Advertisement[]> {
    if (ids.length === 0) return [];
    const docs = await this.model.find({
      $or: [{ id: { $in: ids } }, { adId: { $in: ids } }],
    });
    return docs.map((doc: any) => new Advertisement(doc.toObject() as IAdvertisement));
  }
}

export default AdvertisementRepository;
