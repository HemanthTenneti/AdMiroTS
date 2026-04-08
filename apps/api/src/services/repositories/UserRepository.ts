/**
 * User Repository
 * Handles all database operations for User entities
 */
import { BaseRepository } from "../base/BaseRepository";
import { IUser, User } from "@admiro/domain";
import { UserModel } from "../../config/db";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.model.findOne({ email });
    if (!doc) return null;
    return new User(doc.toObject() as IUser);
  }

  async findByUsername(username: string): Promise<User | null> {
    const doc = await this.model.findOne({ username });
    if (!doc) return null;
    return new User(doc.toObject() as IUser);
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const doc = await this.model.findOne({ googleId });
    if (!doc) return null;
    return new User(doc.toObject() as IUser);
  }

  async findActive(): Promise<User[]> {
    return this.model.find({ isActive: true });
  }
}

export default UserRepository;
