/**
 * Display Connection Request Repository
 * Handles all database operations for DisplayConnectionRequest entities
 */
import { BaseRepository } from "../base/BaseRepository";
import { IDisplayConnectionRequest, DisplayConnectionRequest } from "@admiro/domain";
import { DisplayConnectionRequestModel } from "../../config/db";
import { ConnectionRequestStatus } from "@admiro/domain";

export class DisplayConnectionRequestRepository extends BaseRepository<DisplayConnectionRequest> {
  constructor() {
    super(DisplayConnectionRequestModel);
  }

  async findByStatus(status: string): Promise<DisplayConnectionRequest[]> {
    const docs = await this.model.find({ status });
    return docs.map((doc: any) => new DisplayConnectionRequest(doc.toObject() as IDisplayConnectionRequest));
  }

  async findBySerialNumber(serialNumber: string): Promise<DisplayConnectionRequest | null> {
    const doc = await this.model.findOne({ displayId: serialNumber });
    if (!doc) return null;
    return new DisplayConnectionRequest(doc.toObject() as IDisplayConnectionRequest);
  }

  async findPending(): Promise<DisplayConnectionRequest[]> {
    const docs = await this.model.find({ status: ConnectionRequestStatus.PENDING });
    return docs.map((doc: any) => new DisplayConnectionRequest(doc.toObject() as IDisplayConnectionRequest));
  }

  async findByRequestId(requestId: string): Promise<DisplayConnectionRequest | null> {
    const doc = await this.model.findOne({ requestId });
    if (!doc) return null;
    return new DisplayConnectionRequest(doc.toObject() as IDisplayConnectionRequest);
  }

  async findByDisplayId(displayId: string): Promise<DisplayConnectionRequest | null> {
    const doc = await this.model
      .findOne({ displayId })
      .sort({ createdAt: -1 });
    if (!doc) return null;
    return new DisplayConnectionRequest(doc.toObject() as IDisplayConnectionRequest);
  }
}

export default DisplayConnectionRequestRepository;
