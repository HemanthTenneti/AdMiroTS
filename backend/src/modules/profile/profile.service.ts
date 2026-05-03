/**
 * Profile Service
 * Handles business logic for user profile operations
 */
import { User } from "@admiro/domain";
import { UserRepository } from "../../services/repositories/UserRepository";
import { UpdateProfileRequest } from "@admiro/shared";
import { NotFoundError } from "../../utils/errors/NotFoundError";
import { Logger } from "../../utils/logger";

export class ProfileService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Update allowed fields only
    const updateData: Record<string, any> = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.profilePicture !== undefined) updateData.profilePicture = data.profilePicture;

    updateData.updatedAt = new Date();

    const updatedUser = await this.userRepository.updateById(userId, updateData);
    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    Logger.info(`Profile updated for user: ${userId}`);
    return updatedUser;
  }

  async uploadAvatar(userId: string, avatarUrl: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updatedUser = await this.userRepository.updateById(userId, {
      profilePicture: avatarUrl,
      updatedAt: new Date(),
    });

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    Logger.info(`Avatar uploaded for user: ${userId}`);
    return updatedUser;
  }

  getProfileWithoutPassword(user: User): any {
    return user.toSafeObject();
  }
}

export default ProfileService;
