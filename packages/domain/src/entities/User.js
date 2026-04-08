import { UserRole } from "../enums";
/**
 * User entity class
 * Encapsulates user account business logic and validation
 */
export class User {
    id;
    username;
    email;
    password;
    firstName;
    lastName;
    role;
    googleId;
    isActive;
    profilePicture;
    lastLogin;
    createdAt;
    updatedAt;
    constructor(data) {
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
    getFullName() {
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
    isAdmin() {
        return this.role === UserRole.ADMIN;
    }
    /**
     * Check if user is an advertiser
     */
    isAdvertiser() {
        return this.role === UserRole.ADVERTISER;
    }
    /**
     * Check if user is authenticated via Google OAuth
     */
    isGoogleAuth() {
        return !!this.googleId;
    }
    /**
     * Update last login timestamp
     * Called when user successfully authenticates
     */
    updateLastLogin() {
        this.lastLogin = new Date();
        this.updatedAt = new Date();
    }
    /**
     * Deactivate user account
     * Prevents user from logging in without deleting the account
     */
    deactivate() {
        this.isActive = false;
        this.updatedAt = new Date();
    }
    /**
     * Activate user account
     */
    activate() {
        this.isActive = true;
        this.updatedAt = new Date();
    }
    /**
     * Update profile information
     */
    updateProfile(updates) {
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
    toSafeObject() {
        const { password, ...safeData } = this;
        return safeData;
    }
    /**
     * Validate username format
     * Username must be at least 3 characters
     */
    static isValidUsername(username) {
        return username.length >= 3;
    }
    /**
     * Validate email format
     * Basic email pattern validation
     */
    static isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }
}
