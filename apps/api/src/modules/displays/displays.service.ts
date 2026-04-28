/**
 * Display Service
 * Handles business logic for display operations
 * Implements single responsibility principle - only manages display domain logic
 */
import { Display, DisplayStatus } from "@admiro/domain";
import { DisplayRepository } from "../../services/repositories/DisplayRepository";
import { NotFoundError, ValidationError } from "../../utils/errors/index";
import { Logger } from "../../utils/logger";
import { IdGenerator } from "../../utils/id-generator";

/**
 * Whitelist of allowed sort fields
 * Prevents NoSQL injection attacks through sort parameter
 * Only fields that exist in the database schema are allowed
 */
const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "displayId",
  "location",
  "status",
] as const;

type AllowedSortField = typeof ALLOWED_SORT_FIELDS[number];

/**
 * Inbound data transfer object for creating displays
 * Separated from domain model to control input surface
 */
interface CreateDisplayInput {
  displayId: string;
  location: string;
  layout: string;
  resolution: { width: number; height: number };
  configuration?: any;
  serialNumber?: string;
}

/**
 * Inbound data transfer object for updating displays
 * All fields optional - only provided fields are updated
 */
interface UpdateDisplayInput {
  location?: string;
  configuration?: any;
}

/**
 * Query filters for listing displays
 * Applied to filter and sort database queries
 */
interface ListFilters {
  status?: string | undefined;
  location?: string | undefined;
  layout?: string | undefined;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
}

export class DisplayService {
  private displayRepository: DisplayRepository;

  constructor() {
    // Instantiate repository with dependency injection
    // Repository pattern isolates database access logic
    this.displayRepository = new DisplayRepository();
  }

  /**
   * Create a new display
   * Generates unique IDs, verifies serial number uniqueness, sets initial status to OFFLINE
   *
   * @param data - Display input data
   * @returns Created Display entity
   * @throws ValidationError if serial number already exists
   * @throws NotFoundError if display creation fails
   */
  async createDisplay(data: CreateDisplayInput): Promise<Display> {
    const id = IdGenerator.displayId();

    // Check if serial number already exists (prevent duplicates)
    if (data.serialNumber) {
      const existingDisplay = await this.displayRepository.findBySerialNumber(data.serialNumber);
      if (existingDisplay) {
        throw new ValidationError("Display with this serial number already exists");
      }
    }

    // Create domain entity with initial values
    const display = new Display({
      id,
      displayId: data.displayId,
      displayName: data.displayId, // Use displayId as displayName for now
      location: data.location,
      resolution: data.resolution as any,
      configuration: data.configuration || {
        brightness: 100,
        volume: 50,
        refreshRate: 60,
        orientation: "LANDSCAPE",
      } as any,
      status: DisplayStatus.OFFLINE, // New displays start offline until paired
      currentLoopId: undefined,
      lastSeen: undefined,
      isConnected: false,
      firmwareVersion: "1.0.0",
      connectionToken: `token-${id}`,
      needsRefresh: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Persist to database and return result
    const created = await this.displayRepository.create(display as any);
    Logger.info(`Display created: ${id}`, { displayId: data.displayId, location: data.location });
    return created;
  }

  /**
   * Retrieve display by ID
   * Verifies existence before returning to provide helpful error messages
   *
   * @param id - Display ID
   * @returns Display entity
   * @throws NotFoundError if display doesn't exist
   */
  async getDisplay(id: string): Promise<Display> {
    if (!id) {
      throw new NotFoundError("Display ID is required");
    }
    const display = await this.displayRepository.findById(id);
    if (!display) {
      throw new NotFoundError(`Display with ID ${id} not found`);
    }
    return display;
  }

  /**
   * List displays with pagination and optional filters
   * Supports filtering by status, location, layout, and custom sorting
   * Validates sortBy parameter against whitelist to prevent NoSQL injection
   *
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @param filters - Optional filters and sort configuration
   * @returns Paginated results with total count
   * @throws ValidationError if sortBy is not in whitelist
   */
  async listDisplays(
    page: number,
    limit: number,
    filters?: ListFilters
  ): Promise<{ data: Display[]; total: number }> {
    // Build filter object from provided filters
    // Only include filters that are explicitly set (not undefined)
    const filterObj: Record<string, any> = {};

    if (filters?.status) filterObj.status = filters.status;
    if (filters?.location) filterObj.location = filters.location;
    if (filters?.layout) filterObj.layout = filters.layout;

    // Validate sortBy field against whitelist
    // This prevents NoSQL injection attacks through the sort parameter
    let validSortBy: AllowedSortField = "createdAt";
    if (filters?.sortBy && ALLOWED_SORT_FIELDS.includes(filters.sortBy as any)) {
      validSortBy = filters.sortBy as AllowedSortField;
    } else if (filters?.sortBy) {
      // Reject invalid sort fields to prevent injection
      throw new ValidationError(
        `Invalid sortBy field. Allowed fields: ${ALLOWED_SORT_FIELDS.join(", ")}`
      );
    }

    // Delegate pagination logic to repository
    // Repository handles skip/limit calculation and sorting
    const result = await this.displayRepository.findWithPagination(
      filterObj,
      page,
      limit,
      validSortBy,
      filters?.sortOrder ?? "desc"
    );

    return result;
  }

  /**
   * Update a display's mutable fields
   * Prevents updates to system fields like status (use dedicated methods instead)
   *
   * @param id - Display ID
   * @param data - Partial update data
   * @returns Updated Display entity
   * @throws NotFoundError if display doesn't exist
   */
  async updateDisplay(id: string, data: UpdateDisplayInput): Promise<Display> {
    if (!id) {
      throw new NotFoundError("Display ID is required");
    }
    // Verify display exists before attempting update
    await this.getDisplay(id);

    // Build update object with only changed fields
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.location !== undefined) updateData.location = data.location;
    if (data.configuration !== undefined) updateData.configuration = data.configuration;

    // Persist changes
    const updated = await this.displayRepository.updateById(id, updateData);
    if (!updated) {
      throw new NotFoundError(`Display with ID ${id} not found`);
    }

    Logger.info(`Display updated: ${id}`);
    return updated;
  }

  /**
   * Soft delete a display
   * Sets status to OFFLINE instead of removing record
   * Preserves historical data while removing from active lists
   *
   * @param id - Display ID
   * @throws NotFoundError if display doesn't exist
   */
  async deleteDisplay(id: string): Promise<void> {
    if (!id) {
      throw new NotFoundError("Display ID is required");
    }
    // Verify exists before attempting delete
    await this.getDisplay(id);

    // Soft delete - preserve data by marking as offline
    await this.displayRepository.updateById(id, {
      status: DisplayStatus.OFFLINE,
      updatedAt: new Date(),
    });

    Logger.info(`Display deleted: ${id}`);
  }

  /**
   * Get display status and online/offline information
   * A display is considered online if it was seen within the last 5 minutes
   *
   * @param id - Display ID
   * @returns Status object with online flag and last seen time
   * @throws NotFoundError if display doesn't exist
   */
  async getDisplayStatus(id: string): Promise<any> {
    const display = await this.getDisplay(id);
    // A display is online if it has been seen within the last 5 minutes (300000ms)
    const isOnline = display.lastSeen ? (new Date().getTime() - display.lastSeen.getTime()) < 5 * 60 * 1000 : false;

    return {
      id: display.id,
      displayId: display.displayId,
      status: display.status,
      lastSeen: display.lastSeen,
      isOnline,
    };
  }

  /**
   * Record a ping/heartbeat from a display
   * Updates lastSeen timestamp to track when display last communicated with server
   *
   * @param id - Display ID
   * @throws NotFoundError if display doesn't exist
   */
  async pingDisplay(id: string): Promise<void> {
    if (!id) {
      throw new NotFoundError("Display ID is required");
    }
    // Verify exists before recording ping
    await this.getDisplay(id);

    // Update last seen timestamp
    await this.displayRepository.updateLastPing(id);
    Logger.info(`Display pinged: ${id}`);
  }

  /**
   * Get loops assigned to this display
   *
   * @param id - Display ID
   * @returns Object with display ID and assigned loop ID
   * @throws NotFoundError if display doesn't exist
   */
  async getAssignedLoops(id: string): Promise<any> {
    const display = await this.getDisplay(id);
    return {
      displayId: display.displayId,
      currentLoopId: display.currentLoopId,
      hasAssignedLoop: display.hasAssignedLoop(),
    };
  }

  /**
   * Update display configuration
   * Configuration includes brightness, volume, refresh rate, orientation
   *
   * @param id - Display ID
   * @param config - Configuration object
   * @returns Updated Display entity
   * @throws NotFoundError if display doesn't exist
   */
  async updateDisplayConfig(id: string, config: any): Promise<Display> {
    if (!id) {
      throw new NotFoundError("Display ID is required");
    }
    // Verify exists before updating config
    await this.getDisplay(id);

    const updated = await this.displayRepository.updateById(id, {
      configuration: config,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundError(`Display with ID ${id} not found`);
    }

    Logger.info(`Display config updated: ${id}`);
    return updated;
  }

  /**
   * Get all displays at a specific location
   *
   * @param location - Location string to search for
   * @returns Array of displays at that location
   */
  async getDisplaysByLocation(location: string): Promise<Display[]> {
    if (!location) {
      return [];
    }
    return this.displayRepository.findByLocation(location);
  }

  async pairDisplay(serialNumber: string): Promise<Display> {
    const existing = await this.displayRepository.findBySerialNumber(serialNumber);
    if (!existing) {
      throw new NotFoundError("Display not found");
    }

    const updated = await this.displayRepository.updateById(existing.id, {
      status: DisplayStatus.ONLINE,
      updatedAt: new Date(),
    });

    if (!updated) throw new NotFoundError("Failed to pair display");

    Logger.info(`Display paired: ${serialNumber}`);
    return updated;
  }

  // Self-registration: a physical display device registers itself and waits for admin approval
  async registerSelf(data: {
    displayName: string;
    location: string;
    displayId?: string;
    password?: string;
    resolution: { width: number; height: number };
    browserInfo?: Record<string, string>;
  }): Promise<{ display: Display; connectionToken: string; isPendingApproval: boolean }> {
    const id = IdGenerator.displayId();
    const connectionToken = `ct-${id}-${Date.now()}`;
    const displayId = data.displayId || id;

    // Check if a display with this ID already exists
    const existing = await this.displayRepository.findBySerialNumber(displayId);
    if (existing) {
      throw new ValidationError(`Display with ID "${displayId}" already exists`);
    }

    const display = new Display({
      id,
      displayId,
      displayName: data.displayName,
      location: data.location,
      resolution: data.resolution as any,
      configuration: {
        brightness: 100,
        volume: 50,
        refreshRate: 60,
        orientation: "LANDSCAPE",
      } as any,
      status: DisplayStatus.INACTIVE,
      connectionToken,
      password: data.password,
      isConnected: false,
      needsRefresh: false,
      firmwareVersion: "1.0.0",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await this.displayRepository.create(display as any);
    Logger.info(`Display self-registered: ${displayId} (pending approval)`);

    return { display: created, connectionToken, isPendingApproval: true };
  }

  // Look up a display by its connection token — used by display devices polling for approval
  async getByConnectionToken(token: string): Promise<Display> {
    const display = await this.displayRepository.findByConnectionToken(token);
    if (!display) {
      throw new NotFoundError("Display not found for this connection token");
    }
    return display;
  }

  // Report status from a display device (heartbeat + current ad being played)
  async reportStatus(data: {
    connectionToken: string;
    status: string;
    currentAdPlaying?: string;
  }): Promise<void> {
    const display = await this.displayRepository.findByConnectionToken(data.connectionToken);
    if (!display) {
      throw new NotFoundError("Display not found for this connection token");
    }

    await this.displayRepository.updateById(display.id, {
      lastSeen: new Date(),
      isConnected: true,
      updatedAt: new Date(),
    });

    Logger.info(`Display status reported: ${display.displayId} — ${data.status}`);
  }
}

export default DisplayService;
