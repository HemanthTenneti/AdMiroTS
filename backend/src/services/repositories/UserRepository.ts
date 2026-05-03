/**
 * User Repository
 * Handles all database operations for User entities
 * Single canonical implementation — used by auth, profile, and admin modules
 */
import { BaseRepository } from "../base/BaseRepository";
import { IUser, User, UserRole } from "@admiro/domain";
import { UserModel } from "../../config/db";
import { IdGenerator } from "../../utils/id-generator";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(UserModel);
  }

  /**
   * Create a new user
   * Generates ID and derives username from email if not provided
   */
  async create(userData: Partial<IUser>): Promise<User> {
    const user = new User({
      id: IdGenerator.userId(),
      username: userData.username || userData.email?.split("@")[0] || "user",
      email: userData.email || "",
      role: userData.role || UserRole.ADVERTISER,
      isActive: userData.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
    });

    const doc = await this.model.create(user);
    return new User(doc.toObject() as IUser);
  }

  /**
   * Update user by ID
   * Automatically sets updatedAt timestamp
   */
  async update(id: string, userData: Partial<IUser>): Promise<User | null> {
    const doc = await this.model.findOneAndUpdate(
      { id },
      { ...userData, updatedAt: new Date() },
      { returnDocument: "after" }
    );
    if (!doc) return null;
    return new User(doc.toObject() as IUser);
  }

  /**
   * Find user by email address
   */
  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.model.findOne({ email });
    if (!doc) return null;
    return new User(doc.toObject() as IUser);
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const doc = await this.model.findOne({ username });
    if (!doc) return null;
    return new User(doc.toObject() as IUser);
  }

  /**
   * Find user by Google OAuth ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    const doc = await this.model.findOne({ googleId });
    if (!doc) return null;
    return new User(doc.toObject() as IUser);
  }

  /**
   * Find user by username or email address
   */
  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    const doc = await this.model.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });
    if (!doc) return null;
    return new User(doc.toObject() as IUser);
  }

  /**
   * Find all active users
   */
  async findActive(): Promise<User[]> {
    return this.model.find({ isActive: true });
  }
}

export default UserRepository;
