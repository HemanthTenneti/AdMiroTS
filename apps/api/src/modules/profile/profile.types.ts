/**
 * Profile module types
 */
import { User } from "@admiro/domain";
import { UpdateProfileRequest } from "@admiro/shared";

export interface ProfileContext {
  user: User;
  userId: string;
}

// Helper type for profile response
export type ProfileResponse = Omit<User, "password">;
