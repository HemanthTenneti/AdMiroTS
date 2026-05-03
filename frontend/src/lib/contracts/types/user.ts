/**
 * User management DTOs
 * Handles user profiles, account management, and user listing
 */

import { UserRole } from "@admiro/domain";
import { Timestamps, PaginatedResponse } from "./common";

/**
 * User response DTO
 * Standard user profile representation returned by API endpoints
 * Password and sensitive fields are excluded
 */
export interface UserResponse extends Timestamps {
  id: string;
  username: string;
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  role: UserRole;
  isActive: boolean;
  profilePicture?: string | undefined; // URL or base64 data URI
  lastLogin?: Date | undefined; // ISO 8601 string in JSON
}

/**
 * Update user profile request
 * Allows users to modify their own profile information
 */
export interface UpdateProfileRequest {
  firstName?: string | undefined;
  lastName?: string | undefined;
  profilePicture?: string | undefined; // Base64 data URI or URL
}

/**
 * Change password request
 * Requires current password for security verification
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string; // Must meet password requirements
}

/**
 * Admin user creation request
 * Allows admins to create new user accounts
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  role: UserRole;
}

/**
 * Admin user update request
 * Allows admins to modify any user account
 */
export interface UpdateUserRequest {
  username?: string | undefined;
  email?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  role?: UserRole | undefined;
  isActive?: boolean | undefined;
  profilePicture?: string | undefined;
}

/**
 * User list filter parameters
 * Used to filter and search user listings
 */
export interface UserFilterQuery {
  role?: UserRole | undefined; // Filter by user role
  isActive?: boolean | undefined; // Filter by active status
  search?: string | undefined; // Search by username, email, or name
}

/**
 * Paginated user list response
 * Returns list of users with pagination metadata
 */
export interface UserListResponse extends PaginatedResponse<UserResponse> {}

/**
 * User deletion response
 * Confirms successful user account deletion
 */
export interface DeleteUserResponse {
  id: string;
  message: string;
}

/**
 * User statistics response
 * Aggregate user metrics for admin dashboard
 */
export interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  advertiserCount: number;
  newUsersThisMonth: number;
  lastRegistration?: Date | undefined;
}

/**
 * Bulk user operation request
 * Allows batch operations on multiple users
 */
export interface BulkUserOperationRequest {
  userIds: string[];
  operation: "activate" | "deactivate" | "delete";
}

/**
 * Bulk user operation response
 * Reports results of batch user operations
 */
export interface BulkUserOperationResponse {
  successCount: number;
  failureCount: number;
  errors?: Array<{
    userId: string;
    reason: string;
  }> | undefined;
}
