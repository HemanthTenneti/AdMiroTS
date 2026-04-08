import { UserModel } from "../config/db";
import { User, UserRole } from "@admiro/domain";
import type { IUser } from "@admiro/domain";

/**
 * User Repository
 * Handles database operations for User entity
 */
export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    if (!doc) return null;
    return new User(doc.toObject() as IUser);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email });
    if (!doc) return null;
    return new User(doc.toObject() as IUser);
  }

  /**
   * Find user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    const doc = await UserModel.findOne({ googleId });
    if (!doc) return null;
    return new User(doc.toObject() as IUser);
  }

  /**
   * Create new user
   */
  async create(userData: Partial<IUser>): Promise<User> {
    const user = new User({
      id: new Date().getTime().toString(),
      username: userData.username || userData.email?.split("@")[0] || "user",
      email: userData.email || "",
      role: userData.role || UserRole.ADVERTISER,
      isActive: userData.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
    });

    const doc = await UserModel.create(user);
    return new User(doc.toObject() as IUser);
  }

  /**
   * Update user
   */
  async update(id: string, userData: Partial<IUser>): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(
      id,
      { ...userData, updatedAt: new Date() },
      { new: true }
    );
    if (!doc) return null;
    return new User(doc.toObject() as IUser);
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
}

export default UserRepository;
