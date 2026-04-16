/**
 * Display Loop Repository
 * Handles all database operations for DisplayLoop entities
 */
import { BaseRepository } from "../base/BaseRepository";
import { IDisplayLoop, DisplayLoop } from "@admiro/domain";
import { DisplayLoopModel } from "../../config/db";

export class DisplayLoopRepository extends BaseRepository<DisplayLoop> {
  constructor() {
    super(DisplayLoopModel);
  }

  async findByName(name: string): Promise<DisplayLoop | null> {
    const doc = await this.model.findOne({ loopName: name });
    if (!doc) return null;
    return new DisplayLoop(doc.toObject() as IDisplayLoop);
  }

  async findWithDisplays(): Promise<DisplayLoop[]> {
    const docs = await this.model.find().populate("displayId");
    return docs.map((doc: any) => new DisplayLoop(doc.toObject() as IDisplayLoop));
  }

  async addAdvertisement(loopId: string, adData: any): Promise<void> {
    await this.model.findOneAndUpdate({ id: loopId }, { $push: { advertisements: adData } });
  }

  async removeAdvertisement(loopId: string, adId: string): Promise<void> {
    await this.model.findOneAndUpdate({ id: loopId }, {
      $pull: { "advertisements.advertisementId": adId },
    });
  }
}

export default DisplayLoopRepository;
