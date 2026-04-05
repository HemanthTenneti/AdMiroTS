import { IUser } from "../interfaces";
import { UserRole } from "../enums";

/**
 * User entity class
 * Encapsulates user account business logic and validation
 */
export class User implements IUser {
  id: string;
  username: string;
  email: string;
  password?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  role: UserRole;
  googleId?: string | undefined;
  isActive: boolean;
  profilePicture?: string | undefined;
  lastLogin?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IUser) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.firstName ?? undefined;
    this.lastName = data.lastName ?? undefined;
    this.role = data.role;
    this.googleId = data.googleId ?? undefined;
    this.isActive = data.isActive;
    this.profilePicture = data.profilePicture ?? undefined;
    this.lastLogin = data.lastLogin ?? undefined;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Get the user's full name
   * Combines firstName and lastName, falling back to username if unavailable
   */
  getFullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    if (this.firstName) {
      return this.firstName;
    }
    if (this.lastName) {
      return this.lastName;
    }
    return this.username;
  }

  /**
   * Check if user is an administrator
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Check if user is an advertiser
   */
  isAdvertiser(): boolean {
    return this.role === UserRole.ADVERTISER;
  }

  /**
   * Check if user is authenticated via Google OAuth
   */
  isGoogleAuth(): boolean {
    return !!this.googleId;
  }

  /**
   * Update last login timestamp
   * Called when user successfully authenticates
   */
  updateLastLogin(): void {
    this.lastLogin = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Deactivate user account
   * Prevents user from logging in without deleting the account
   */
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Activate user account
   */
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Update profile information
   */
  updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  }): void {
    if (updates.firstName !== undefined) {
      this.firstName = updates.firstName;
    }
    if (updates.lastName !== undefined) {
      this.lastName = updates.lastName;
    }
    if (updates.profilePicture !== undefined) {
      this.profilePicture = updates.profilePicture;
    }
    this.updatedAt = new Date();
  }

  /**
   * Get sanitized user data (exclude password)
   * Used for API responses to prevent password leakage
   */
  toSafeObject(): Omit<IUser, "password"> {
    const { password, ...safeData } = this;
    return safeData;
  }

  /**
   * Validate username format
   * Username must be at least 3 characters
   */
  static isValidUsername(username: string): boolean {
    return username.length >= 3;
  }

  /**
   * Validate email format
   * Basic email pattern validation
   */
  static isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
}
