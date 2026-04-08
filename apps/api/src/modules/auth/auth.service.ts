import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User, UserRole } from "@admiro/domain";
import type { IUser } from "@admiro/domain";
import UserRepository from "../../config/user.repository";
import { JWTPayload } from "../../types/auth.types";

/**
 * Authentication Service
 * Handles business logic for user authentication, registration, and token management
 */
export class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private bcryptSaltRounds: number;

  constructor(
    jwtSecret: string,
    jwtExpiresIn: string = "7d",
    bcryptSaltRounds: number = 10
  ) {
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is required for AuthService");
    }
    this.jwtSecret = jwtSecret;
    this.jwtExpiresIn = jwtExpiresIn;
    this.bcryptSaltRounds = bcryptSaltRounds;
    this.userRepository = new UserRepository();
  }

  /**
   * Generate JWT token for user
   * Creates signed token with user ID, email, and role
   */
  generateToken(user: User): string {
    const payload: Omit<JWTPayload, "iat" | "exp"> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.bcryptSaltRounds);
  }

  /**
   * Compare password with hashed password
   */
  async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Register new user with email and password
   * Creates user account and returns user with token
   */
  async register(
    email: string,
    password: string,
    username: string | undefined,
    role: UserRole | undefined
  ): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user - username is required, derive from email if not provided
    let finalUsername: string;
    if (username) {
      finalUsername = username;
    } else {
      const emailParts = email.split("@");
      finalUsername = emailParts[0] || "user";
    }
    
    const finalRole: UserRole = role || UserRole.ADVERTISER;
    
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      username: finalUsername,
      role: finalRole,
      isActive: true,
    });

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Login user with email and password
   * Validates credentials and returns user with token
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("User account is inactive");
    }

    // Verify password
    if (!user.password) {
      throw new Error("User account has no password set");
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Update last login
    user.updateLastLogin();
    await this.userRepository.update(user.id, {
      lastLogin: user.lastLogin,
      updatedAt: user.updatedAt,
    });

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Handle Google OAuth login/registration
   * Finds existing user or creates new one, returns user with token
   */
  async googleAuth(
    googleId: string,
    email: string,
    firstName?: string,
    profilePicture?: string
  ): Promise<{ user: User; token: string; isNewUser: boolean }> {
    // Find existing user by Google ID
    let user = await this.userRepository.findByGoogleId(googleId);
    let isNewUser = false;

    if (!user) {
      // Check if user exists with same email
      const existingEmailUser = await this.userRepository.findByEmail(email);
      if (existingEmailUser) {
        // Link Google ID to existing account
        user = await this.userRepository.update(existingEmailUser.id, {
          googleId,
          profilePicture: profilePicture || existingEmailUser.profilePicture,
        });
        if (!user) {
          throw new Error("Failed to update user with Google ID");
        }
      } else {
        // Create new user
        user = await this.userRepository.create({
          googleId,
          email,
          firstName,
          profilePicture,
          role: UserRole.ADVERTISER,
          isActive: true,
        });
        isNewUser = true;
      }
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("User account is inactive");
    }

    // Update last login
    user.updateLastLogin();
    await this.userRepository.update(user.id, {
      lastLogin: user.lastLogin,
      updatedAt: user.updatedAt,
    });

    // Generate token
    const token = this.generateToken(user);

    return { user, token, isNewUser };
  }

  /**
   * Verify JWT token and return decoded payload
   */
  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as unknown as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token has expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      }
      throw new Error("Token verification failed");
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  /**
   * Refresh token for user
   * Generates new token with updated expiration
   */
  async refreshToken(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isActive) {
      throw new Error("User account is inactive");
    }

    return this.generateToken(user);
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.password) {
      throw new Error("User account has no password set");
    }

    // Verify current password
    const isPasswordValid = await this.comparePassword(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password
    await this.userRepository.update(userId, {
      password: hashedPassword,
    });
  }
}

export default AuthService;
