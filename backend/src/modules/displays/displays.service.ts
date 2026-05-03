/**
 * Display Service
 * Handles business logic for display operations and display-device workflows.
 */
import bcrypt from "bcrypt";
import {
  Display,
  DisplayStatus,
  ConnectionRequestStatus,
  DisplayConnectionRequest,
  DisplayLoop,
} from "@admiro/domain";
import { DisplayRepository } from "../../services/repositories/DisplayRepository";
import { DisplayConnectionRequestRepository } from "../../services/repositories/DisplayConnectionRequestRepository";
import { DisplayLoopRepository } from "../../services/repositories/DisplayLoopRepository";
import { AdvertisementRepository } from "../../services/repositories/AdvertisementRepository";
import { NotFoundError, ValidationError, ForbiddenError } from "../../utils/errors/index";
import { Logger } from "../../utils/logger";
import { IdGenerator } from "../../utils/id-generator";

const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "displayId", "location", "status"] as const;
type AllowedSortField = (typeof ALLOWED_SORT_FIELDS)[number];

interface CreateDisplayInput {
  displayId: string;
  location: string;
  layout: string;
  resolution: { width: number; height: number };
  configuration?: unknown;
  serialNumber?: string;
}

interface UpdateDisplayInput {
  location?: string;
  configuration?: unknown;
}

interface ListFilters {
  status?: string;
  location?: string;
  layout?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface ListConnectionRequestFilters {
  status?: ConnectionRequestStatus;
  sortOrder?: "asc" | "desc";
}

export class DisplayService {
  private readonly displayRepository: DisplayRepository;
  private readonly connectionRequestRepository: DisplayConnectionRequestRepository;
  private readonly displayLoopRepository: DisplayLoopRepository;
  private readonly advertisementRepository: AdvertisementRepository;
  private readonly bcryptSaltRounds: number;

  constructor() {
    this.displayRepository = new DisplayRepository();
    this.connectionRequestRepository = new DisplayConnectionRequestRepository();
    this.displayLoopRepository = new DisplayLoopRepository();
    this.advertisementRepository = new AdvertisementRepository();
    this.bcryptSaltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? "12");
  }

  async createDisplay(data: CreateDisplayInput): Promise<Display> {
    const id = IdGenerator.displayId();

    if (data.serialNumber) {
      const existingDisplay = await this.displayRepository.findByDisplayId(data.displayId);
      if (existingDisplay) {
        throw new ValidationError("Display with this serial number already exists");
      }
    }

    const display = new Display({
      id,
      displayId: data.displayId,
      displayName: data.displayId,
      location: data.location,
      resolution: data.resolution as any,
      configuration:
        (data.configuration as any) ?? {
          brightness: 100,
          volume: 50,
          refreshRate: 60,
          orientation: "LANDSCAPE",
        },
      status: DisplayStatus.OFFLINE,
      currentLoopId: undefined,
      lastSeen: undefined,
      isConnected: false,
      firmwareVersion: "1.0.0",
      connectionToken: `token-${id}`,
      needsRefresh: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await this.displayRepository.create(display as any);
    Logger.info(`Display created: ${id}`, { displayId: data.displayId, location: data.location });
    return created;
  }

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

  async listDisplays(page: number, limit: number, filters?: ListFilters): Promise<{ data: Display[]; total: number }> {
    const filterObj: Record<string, unknown> = {};

    if (filters?.status) filterObj.status = filters.status;
    if (filters?.location) filterObj.location = filters.location;
    if (filters?.layout) filterObj.layout = filters.layout;

    let validSortBy: AllowedSortField = "createdAt";
    if (filters?.sortBy && ALLOWED_SORT_FIELDS.includes(filters.sortBy as AllowedSortField)) {
      validSortBy = filters.sortBy as AllowedSortField;
    } else if (filters?.sortBy) {
      throw new ValidationError(`Invalid sortBy field. Allowed fields: ${ALLOWED_SORT_FIELDS.join(", ")}`);
    }

    return this.displayRepository.findWithPagination(
      filterObj,
      page,
      limit,
      validSortBy,
      filters?.sortOrder ?? "desc"
    );
  }

  async updateDisplay(id: string, adminId: string, data: UpdateDisplayInput): Promise<Display> {
    if (!id) {
      throw new NotFoundError("Display ID is required");
    }

    const display = await this.getDisplay(id);

    if (display.assignedAdminId && display.assignedAdminId !== adminId) {
      throw new ForbiddenError("You do not have permission to update this display");
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.location !== undefined) updateData.location = data.location;
    if (data.configuration !== undefined) updateData.configuration = data.configuration;

    const updated = await this.displayRepository.updateById(id, updateData);
    if (!updated) {
      throw new NotFoundError(`Display with ID ${id} not found`);
    }

    Logger.info(`Display updated: ${id}`, { updatedBy: adminId });
    return updated;
  }

  async deleteDisplay(id: string, adminId: string): Promise<void> {
    if (!id) {
      throw new NotFoundError("Display ID is required");
    }

    const display = await this.getDisplay(id);

    if (display.assignedAdminId && display.assignedAdminId !== adminId) {
      throw new ForbiddenError("You do not have permission to delete this display");
    }

    await this.displayRepository.updateById(id, {
      status: DisplayStatus.OFFLINE,
      updatedAt: new Date(),
    });

    Logger.info(`Display deleted: ${id}`, { deletedBy: adminId });
  }

  async getDisplayStatus(id: string): Promise<{
    id: string;
    displayId: string;
    status: string;
    lastSeen: Date | undefined;
    isOnline: boolean;
  }> {
    const display = await this.getDisplay(id);
    const isOnline = display.lastSeen
      ? new Date().getTime() - display.lastSeen.getTime() < 5 * 60 * 1000
      : false;

    return {
      id: display.id,
      displayId: display.displayId,
      status: display.status,
      lastSeen: display.lastSeen,
      isOnline,
    };
  }

  async pingDisplay(id: string): Promise<void> {
    if (!id) {
      throw new NotFoundError("Display ID is required");
    }

    await this.getDisplay(id);

    await this.displayRepository.updateLastPing(id);
    Logger.info(`Display pinged: ${id}`);
  }

  async getAssignedLoops(id: string): Promise<{ displayId: string; currentLoopId: string | undefined; hasAssignedLoop: boolean }> {
    const display = await this.getDisplay(id);
    return {
      displayId: display.displayId,
      currentLoopId: display.currentLoopId,
      hasAssignedLoop: display.hasAssignedLoop(),
    };
  }

  async updateDisplayConfig(id: string, config: unknown): Promise<Display> {
    if (!id) {
      throw new NotFoundError("Display ID is required");
    }

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

  async getDisplaysByLocation(location: string): Promise<Display[]> {
    if (!location) {
      return [];
    }

    return this.displayRepository.findByLocation(location);
  }

  async pairDisplay(serialNumber: string): Promise<Display> {
    const existing = await this.displayRepository.findByDisplayId(serialNumber);
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

    const existing = await this.displayRepository.findByDisplayId(displayId);
    if (existing) {
      throw new ValidationError(`Display with ID "${displayId}" already exists`);
    }

    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, this.bcryptSaltRounds);
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
      password: hashedPassword,
      isConnected: false,
      needsRefresh: false,
      firmwareVersion: data.browserInfo?.browserVersion ?? "Web",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await this.displayRepository.create(display as any);

    // Use the pre-generated domain ID rather than relying on Mongoose document accessors.
    // Mongoose `doc.id` may resolve to the Mongo ObjectId virtual in some contexts.
    const request = DisplayConnectionRequest.create({
      displayId: display.id,
      displayName: display.displayName,
      displayLocation: display.location,
      firmwareVersion: display.firmwareVersion,
    });

    await this.connectionRequestRepository.create(request as any);

    Logger.info(`Display self-registered: ${displayId} (pending approval)`);

    return { display: created, connectionToken, isPendingApproval: true };
  }

  async getByConnectionToken(token: string): Promise<{
    display: Display;
    connectionRequestStatus: ConnectionRequestStatus;
    connectionRequestId?: string;
    rejectionReason?: string;
  }> {
    const display = await this.displayRepository.findByConnectionToken(token);
    if (!display) {
      throw new NotFoundError("Display not found for this connection token");
    }

    const connectionRequest = await this.connectionRequestRepository.findByDisplayId(display.id);

    const inferredStatus =
      connectionRequest?.status ??
      (display.assignedAdminId ? ConnectionRequestStatus.APPROVED : ConnectionRequestStatus.PENDING);

    return {
      display,
      connectionRequestStatus: inferredStatus,
      connectionRequestId: connectionRequest?.requestId ?? display.id,
      rejectionReason: connectionRequest?.rejectionReason,
    };
  }

  async reportStatus(data: {
    connectionToken: string;
    status: string;
    currentAdPlaying?: string;
  }): Promise<void> {
    const display = await this.displayRepository.findByConnectionToken(data.connectionToken);
    if (!display) {
      throw new NotFoundError("Display not found for this connection token");
    }

    const normalizedStatus = data.status?.toLowerCase();
    const status =
      normalizedStatus === DisplayStatus.ONLINE || normalizedStatus === DisplayStatus.OFFLINE
        ? normalizedStatus
        : DisplayStatus.ONLINE;

    await this.displayRepository.updateById(display.id, {
      status,
      lastSeen: new Date(),
      isConnected: true,
      updatedAt: new Date(),
    });

    Logger.info(`Display status reported: ${display.displayId} - ${status}`, {
      currentAdPlaying: data.currentAdPlaying,
    });
  }

  async loginDisplay(data: { displayId: string; password: string }): Promise<Display> {
    const display = await this.displayRepository.findByDisplayId(data.displayId);
    if (!display) {
      throw new NotFoundError("Display not found. Invalid Display ID.");
    }

    if (!display.password) {
      throw new ValidationError(
        "This display does not have password authentication enabled. Please use your connection token instead."
      );
    }

    const isPasswordValid = await bcrypt.compare(data.password, display.password);
    if (!isPasswordValid) {
      throw new ForbiddenError("Invalid password.");
    }

    return display;
  }

  async getDisplayLoopByToken(token: string): Promise<{ loop: DisplayLoop | null; advertisements: any[] }> {
    const display = await this.displayRepository.findByConnectionToken(token);
    if (!display) {
      throw new NotFoundError("Display not found.");
    }

    let loop: DisplayLoop | null = null;

    if (display.currentLoopId) {
      loop = await this.displayLoopRepository.findById(display.currentLoopId);
    }

    if (!loop) {
      loop = await this.displayLoopRepository.findByDisplayId(display.id);
    }

    if (!loop) {
      return { loop: null, advertisements: [] };
    }

    const adIds = loop.advertisements.map((entry) => entry.advertisementId);
    const ads = await this.advertisementRepository.findByAnyIds(adIds);

    const advertisementMap = new Map<string, any>();
    for (const ad of ads) {
      advertisementMap.set(ad.id, ad);
      advertisementMap.set(ad.adId, ad);
    }

    const sortedEntries = [...loop.advertisements].sort((a, b) => a.order - b.order);
    const advertisements = sortedEntries
      .map((entry) => {
        const ad = advertisementMap.get(entry.advertisementId);
        if (!ad) return null;
        return {
          id: ad.id,
          adId: ad.adId,
          adName: ad.adName,
          mediaUrl: ad.mediaUrl,
          mediaType: ad.mediaType,
          duration: entry.duration ?? ad.duration,
          order: entry.order,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    return { loop, advertisements };
  }

  async listConnectionRequests(
    page: number,
    limit: number,
    filters?: ListConnectionRequestFilters
  ): Promise<{ data: Array<Record<string, unknown>>; total: number }> {
    const filterObj: Record<string, unknown> = {};

    if (filters?.status) {
      filterObj.status = filters.status;
    }

    const { data, total } = await this.connectionRequestRepository.findWithPagination(
      filterObj,
      page,
      limit,
      "createdAt",
      filters?.sortOrder ?? "desc"
    );

    const normalizedRequests = data.map((request: any) =>
      typeof request?.toObject === "function" ? request.toObject() : request
    );

    const displayIds = normalizedRequests
      .map((request: any) => request.displayId)
      .filter((displayId: unknown): displayId is string => typeof displayId === "string" && displayId.length > 0);
    const displays = await this.displayRepository.findByDisplayIds(displayIds);
    const displayMap = new Map(displays.map((display) => [display.id, display]));

    const hydrated = normalizedRequests.map((request: any) => {
      const requestId =
        (typeof request.requestId === "string" && request.requestId) ||
        (typeof request.id === "string" && request.id) ||
        (typeof request.displayId === "string" && request.displayId) ||
        "";
      const displayId = typeof request.displayId === "string" ? request.displayId : "";
      const status = Object.values(ConnectionRequestStatus).includes(request.status as ConnectionRequestStatus)
        ? request.status
        : ConnectionRequestStatus.PENDING;
      const display = displayMap.get(displayId);

      return {
        ...request,
        id: typeof request.id === "string" ? request.id : requestId,
        requestId,
        displayId,
        status,
        respondedAt: request.respondedAt ?? null,
        rejectionReason: request.rejectionReason ?? null,
        display: display
          ? {
              id: display.id,
              displayId: display.displayId,
              displayName: display.displayName,
              location: display.location,
              status: display.status,
              assignedAdminId: display.assignedAdminId,
            }
          : null,
      };
    });

    const hydratedDisplayIds = new Set(
      hydrated.map((request: any) => String(request.displayId))
    );

    // Compatibility fallback for legacy records:
    // if a self-registered display has no persisted request row, expose a synthetic pending item.
    if (!filters?.status || filters.status === ConnectionRequestStatus.PENDING) {
      const { data: allDisplays } = await this.displayRepository.findWithPagination(
        {},
        1,
        5000,
        "createdAt",
        "desc"
      );
      for (const display of allDisplays) {
        if (!display.connectionToken.startsWith("ct-")) continue;
        if (display.assignedAdminId) continue;
        if (hydratedDisplayIds.has(display.id)) continue;

        hydrated.push({
          id: display.id,
          requestId: display.id,
          displayId: display.id,
          displayName: display.displayName,
          displayLocation: display.location,
          firmwareVersion: display.firmwareVersion,
          status: ConnectionRequestStatus.PENDING,
          requestedAt: display.createdAt,
          respondedAt: null,
          respondedById: null,
          rejectionReason: null,
          createdAt: display.createdAt,
          updatedAt: display.updatedAt,
          display: {
            id: display.id,
            displayId: display.displayId,
            displayName: display.displayName,
            location: display.location,
            status: display.status,
            assignedAdminId: display.assignedAdminId,
          },
        });
      }
    }

    return { data: hydrated, total: Math.max(total, hydrated.length) };
  }

  async approveConnectionRequest(requestId: string, adminId: string): Promise<{ request: DisplayConnectionRequest; display: Display }> {
    let request = await this.connectionRequestRepository.findByRequestId(requestId);
    const fallbackDisplay = !request
      ? await this.displayRepository.findById(requestId)
      : null;

    if (!request && !fallbackDisplay) {
      throw new NotFoundError("Connection request not found");
    }

    if (request && !request.isPending()) {
      throw new ValidationError(`Cannot approve a ${request.status} request`);
    }

    const display = request
      ? await this.displayRepository.findById(request.displayId)
      : fallbackDisplay;

    if (!display) {
      throw new NotFoundError("Associated display not found");
    }

    if (request) {
      request.approve(adminId);
      await this.connectionRequestRepository.updateById(request.id, {
        status: request.status,
        respondedAt: request.respondedAt,
        respondedById: request.respondedById,
        updatedAt: request.updatedAt,
      });
    } else {
      request = DisplayConnectionRequest.create({
        displayId: display.id,
        displayName: display.displayName,
        displayLocation: display.location,
        firmwareVersion: display.firmwareVersion,
      });
      request.approve(adminId);
    }

    const updatedDisplay = await this.displayRepository.updateById(display.id, {
      assignedAdminId: adminId,
      status: DisplayStatus.OFFLINE,
      updatedAt: new Date(),
    });

    if (!updatedDisplay) {
      throw new NotFoundError("Associated display not found");
    }

    Logger.info(`Connection request approved: ${request.requestId}`, {
      adminId,
      displayId: updatedDisplay.displayId,
    });

    return {
      request,
      display: updatedDisplay,
    };
  }

  async rejectConnectionRequest(requestId: string, adminId: string, rejectionReason?: string): Promise<DisplayConnectionRequest> {
    const persistedRequest = await this.connectionRequestRepository.findByRequestId(requestId);
    const fallbackDisplay = !persistedRequest
      ? await this.displayRepository.findById(requestId)
      : null;

    if (!persistedRequest && !fallbackDisplay) {
      throw new NotFoundError("Connection request not found");
    }

    if (persistedRequest && !persistedRequest.isPending()) {
      throw new ValidationError(`Cannot reject a ${persistedRequest.status} request`);
    }

    let request: DisplayConnectionRequest;

    if (persistedRequest) {
      request = persistedRequest;
      request.reject(adminId, rejectionReason);

      await this.connectionRequestRepository.updateById(request.id, {
        status: request.status,
        respondedAt: request.respondedAt,
        respondedById: request.respondedById,
        rejectionReason: request.rejectionReason,
        updatedAt: request.updatedAt,
      });
    } else if (fallbackDisplay) {
      request = DisplayConnectionRequest.create({
        displayId: fallbackDisplay.id,
        displayName: fallbackDisplay.displayName,
        displayLocation: fallbackDisplay.location,
        firmwareVersion: fallbackDisplay.firmwareVersion,
      });
      request.reject(adminId, rejectionReason);
    } else {
      throw new NotFoundError("Connection request not found");
    }

    await this.displayRepository.updateById(request.displayId, {
      status: DisplayStatus.INACTIVE,
      updatedAt: new Date(),
    });

    Logger.info(`Connection request rejected: ${request.requestId}`, {
      adminId,
      rejectionReason,
    });

    return request;
  }
}

export default DisplayService;
