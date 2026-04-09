import { IUser } from "../interfaces";
import { UserRole } from "../enums";
/**
 * User entity class
 * Encapsulates user account business logic and validation
 */
export declare class User implements IUser {
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
    failedLoginAttempts?: number | undefined;
    isLocked?: boolean | undefined;
    lockedUntil?: Date | undefined;
    createdAt: Date;
    updatedAt: Date;
    constructor(data: IUser);
    /**
     * Get the user's full name
     * Combines firstName and lastName, falling back to username if unavailable
     */
    getFullName(): string;
    /**
     * Check if user is an administrator
     */
    isAdmin(): boolean;
    /**
     * Check if user is an advertiser
     */
    isAdvertiser(): boolean;
    /**
     * Check if user is authenticated via Google OAuth
     */
    isGoogleAuth(): boolean;
    /**
     * Update last login timestamp
     * Called when user successfully authenticates
     */
    updateLastLogin(): void;
    /**
     * Deactivate user account
     * Prevents user from logging in without deleting the account
     */
    deactivate(): void;
    /**
     * Activate user account
     */
    activate(): void;
    /**
     * Update profile information
     */
    updateProfile(updates: {
        firstName?: string;
        lastName?: string;
        profilePicture?: string;
    }): void;
    /**
     * Get sanitized user data (exclude password)
     * Used for API responses to prevent password leakage
     */
    toSafeObject(): Omit<IUser, "password">;
    /**
     * Validate username format
     * Username must be at least 3 characters
     */
    static isValidUsername(username: string): boolean;
    /**
     * Validate email format
     * Basic email pattern validation
     */
    static isValidEmail(email: string): boolean;
}
//# sourceMappingURL=User.d.ts.map