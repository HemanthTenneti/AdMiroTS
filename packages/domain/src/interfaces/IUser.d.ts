import { UserRole } from "../enums";
/**
 * User entity interface
 * Represents a user account in the system (Admin or Advertiser)
 */
export interface IUser {
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
}
//# sourceMappingURL=IUser.d.ts.map