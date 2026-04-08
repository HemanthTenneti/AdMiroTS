/**
 * Profile Controller
 * Handles HTTP requests for profile operations
 */
import { Request, Response } from "express";
import ProfileService from "./profile.service";
import { AuthenticatedRequest } from "../../types/auth.types";
import { UnauthorizedError } from "../../utils/errors/UnauthorizedError";
import { SuccessResponse } from "@admiro/shared";

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  private getUser(req: Request): any {
    const authReq = req as Request & AuthenticatedRequest;
    if (!authReq.user) {
      throw new UnauthorizedError("User not authenticated");
    }
    return authReq.user;
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = this.getUser(req);
      const profile = await this.profileService.getProfile(user.id);
      const safeProfile = this.profileService.getProfileWithoutPassword(profile);

      const response: SuccessResponse<any> = {
        success: true,
        data: safeProfile,
      };
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Get profile error:", error.message);
      }
      throw error;
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = this.getUser(req);
      const { firstName, lastName, profilePicture } = req.body;

      const updatedUser = await this.profileService.updateProfile(user.id, {
        firstName,
        lastName,
        profilePicture,
      });

      const safeProfile = this.profileService.getProfileWithoutPassword(updatedUser);

      const response: SuccessResponse<any> = {
        success: true,
        data: safeProfile,
      };
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Update profile error:", error.message);
      }
      throw error;
    }
  }

  async uploadAvatar(req: Request, res: Response): Promise<void> {
    try {
      const user = this.getUser(req);
      const { avatarUrl } = req.body;

      if (!avatarUrl) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Avatar URL is required",
            details: undefined,
          },
        });
        return;
      }

      const updatedUser = await this.profileService.uploadAvatar(user.id, avatarUrl);
      const safeProfile = this.profileService.getProfileWithoutPassword(updatedUser);

      const response: SuccessResponse<any> = {
        success: true,
        data: safeProfile,
      };
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Upload avatar error:", error.message);
      }
      throw error;
    }
  }

  async getAvatar(req: Request, res: Response): Promise<void> {
    try {
      const user = this.getUser(req);
      const profile = await this.profileService.getProfile(user.id);

      const response: SuccessResponse<{ avatarUrl: string | undefined }> = {
        success: true,
        data: {
          avatarUrl: profile.profilePicture,
        },
      };
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Get avatar error:", error.message);
      }
      throw error;
    }
  }
}

export default ProfileController;
