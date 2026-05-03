/**
 * Display Controller
 * Handles HTTP requests for display operations.
 */
import { Request, Response } from "express";
import DisplayService from "./displays.service";
import { AuthenticatedRequest } from "../../types/auth.types";
import { UnauthorizedError, ValidationError } from "../../utils/errors/index";
import { SuccessResponse } from "@admiro/shared";
import { ConnectionRequestStatus } from "@admiro/domain";

export class DisplayController {
  private readonly displayService: DisplayService;

  constructor() {
    this.displayService = new DisplayService();
  }

  private getUser(req: Request): NonNullable<AuthenticatedRequest["user"]> {
    const authReq = req as Request & AuthenticatedRequest;
    if (!authReq.user) {
      throw new UnauthorizedError("User not authenticated");
    }
    return authReq.user;
  }

  async createDisplay(req: Request, res: Response): Promise<void> {
    const { displayId, location, layout, resolution, configuration, serialNumber } = req.body;

    const display = await this.displayService.createDisplay({
      displayId,
      location,
      layout,
      resolution,
      configuration,
      serialNumber,
    });

    const response: SuccessResponse<any> = {
      success: true,
      data: display,
    };
    res.status(201).json(response);
  }

  async listDisplays(req: Request, res: Response): Promise<void> {
    const { page, limit, status, location, layout, sortBy, sortOrder } = req.query;

    // Auto-scope to the authenticated admin's displays if a JWT is present.
    // Dashboard users only see displays assigned to them; unauthenticated
    // callers (e.g., display clients) see everything.
    const authReq = req as Request & AuthenticatedRequest;
    const assignedAdminId = authReq.user?.id ?? undefined;

    const result = await this.displayService.listDisplays(Number(page) || 1, Number(limit) || 10, {
      status: typeof status === "string" ? status : undefined,
      location: typeof location === "string" ? location : undefined,
      layout: typeof layout === "string" ? layout : undefined,
      sortBy: typeof sortBy === "string" ? sortBy : undefined,
      sortOrder: (sortOrder as "asc" | "desc") || undefined,
      assignedAdminId,
    });

    const response: SuccessResponse<any> = {
      success: true,
      data: {
        data: result.data,
        pagination: {
          page: Number(page) || 1,
          limit: Number(limit) || 10,
          total: result.total,
          hasMore: (Number(page) || 1) * (Number(limit) || 10) < result.total,
        },
      },
    };
    res.status(200).json(response);
  }

  async getDisplay(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new ValidationError("Display ID is required");
    }

    const display = await this.displayService.getDisplay(id);

    const response: SuccessResponse<any> = {
      success: true,
      data: display,
    };
    res.status(200).json(response);
  }

  async updateDisplay(req: Request, res: Response): Promise<void> {
    const user = this.getUser(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new ValidationError("Display ID is required");
    }

    const display = await this.displayService.updateDisplay(id, user.id, req.body);

    const response: SuccessResponse<any> = {
      success: true,
      data: display,
    };
    res.status(200).json(response);
  }

  async deleteDisplay(req: Request, res: Response): Promise<void> {
    const user = this.getUser(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new ValidationError("Display ID is required");
    }

    await this.displayService.deleteDisplay(id, user.id);

    const response: SuccessResponse<any> = {
      success: true,
      data: { message: "Display deleted successfully" },
    };
    res.status(200).json(response);
  }

  async getDisplayStatus(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new ValidationError("Display ID is required");
    }

    const status = await this.displayService.getDisplayStatus(id);

    const response: SuccessResponse<any> = {
      success: true,
      data: status,
    };
    res.status(200).json(response);
  }

  async pingDisplay(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new ValidationError("Display ID is required");
    }

    await this.displayService.pingDisplay(id);

    const response: SuccessResponse<any> = {
      success: true,
      data: { message: "Ping received" },
    };
    res.status(200).json(response);
  }

  async getAssignedLoops(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new ValidationError("Display ID is required");
    }

    const loops = await this.displayService.getAssignedLoops(id);

    const response: SuccessResponse<any> = {
      success: true,
      data: loops,
    };
    res.status(200).json(response);
  }

  async pairDisplay(req: Request, res: Response): Promise<void> {
    const { serialNumber } = req.body;
    const display = await this.displayService.pairDisplay(serialNumber);

    const response: SuccessResponse<any> = {
      success: true,
      data: display,
    };
    res.status(201).json(response);
  }

  async updateDisplayConfig(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new ValidationError("Display ID is required");
    }

    const display = await this.displayService.updateDisplayConfig(id, req.body);

    const response: SuccessResponse<any> = {
      success: true,
      data: display,
    };
    res.status(200).json(response);
  }

  async getDisplaysByLocation(req: Request, res: Response): Promise<void> {
    const location = Array.isArray(req.params.location)
      ? req.params.location[0]
      : req.params.location;

    if (!location) throw new ValidationError("Location is required");

    const displays = await this.displayService.getDisplaysByLocation(location);
    res.status(200).json({ success: true, data: displays });
  }

  async registerSelf(req: Request, res: Response): Promise<void> {
    const { displayName, location, displayId, password, resolution, browserInfo } = req.body;

    if (!displayName || !location) {
      throw new ValidationError("displayName and location are required");
    }

    const result = await this.displayService.registerSelf({
      displayName,
      location,
      displayId,
      password,
      resolution: resolution || { width: 1920, height: 1080 },
      browserInfo,
    });

    res.status(201).json({
      success: true,
      data: {
        displayId: result.display.displayId,
        connectionToken: result.connectionToken,
        status: result.display.status,
        isPendingApproval: result.isPendingApproval,
      },
    });
  }

  async getByConnectionToken(req: Request, res: Response): Promise<void> {
    const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
    if (!token) throw new ValidationError("Connection token is required");

    const result = await this.displayService.getByConnectionToken(token);

    const payload = {
      ...result.display,
      assignedAdmin: result.display.assignedAdminId,
      connectionRequestStatus: result.connectionRequestStatus,
      connectionRequestId: result.connectionRequestId ?? null,
      rejectionReason: result.rejectionReason ?? null,
    };

    res.status(200).json({ success: true, data: payload });
  }

  async reportStatus(req: Request, res: Response): Promise<void> {
    const { connectionToken, status, currentAdPlaying } = req.body;

    if (!connectionToken) throw new ValidationError("connectionToken is required");

    await this.displayService.reportStatus({ connectionToken, status, currentAdPlaying });
    res.status(200).json({ success: true, data: { message: "Status recorded" } });
  }

  async loginDisplay(req: Request, res: Response): Promise<void> {
    const { displayId, password } = req.body;

    if (!displayId) {
      throw new ValidationError("Display ID is required.");
    }

    const display = await this.displayService.loginDisplay({ displayId, password });

    res.status(200).json({
      success: true,
      data: {
        displayId: display.displayId,
        displayName: display.displayName,
        location: display.location,
        connectionToken: display.connectionToken,
        resolution: display.resolution,
        status: display.status,
      },
    });
  }

  async getDisplayLoop(req: Request, res: Response): Promise<void> {
    const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
    if (!token) throw new ValidationError("Connection token is required");

    const result = await this.displayService.getDisplayLoopByToken(token);

    res.status(200).json({
      success: true,
      data: {
        loop: result.loop,
        advertisements: result.advertisements,
      },
    });
  }

  async getConnectionRequests(req: Request, res: Response): Promise<void> {
    this.getUser(req);

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const status = req.query.status as ConnectionRequestStatus | undefined;

    const validStatus =
      status && Object.values(ConnectionRequestStatus).includes(status)
        ? status
        : undefined;

    const result = await this.displayService.listConnectionRequests(page, limit, {
      status: validStatus,
      sortOrder: "desc",
    });

    res.status(200).json({
      success: true,
      data: {
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.total,
          hasMore: page * limit < result.total,
        },
      },
    });
  }

  async approveConnectionRequest(req: Request, res: Response): Promise<void> {
    const user = this.getUser(req);
    const requestId = req.params.requestId as string;

    if (!requestId) {
      throw new ValidationError("requestId is required");
    }

    const result = await this.displayService.approveConnectionRequest(requestId, user.id);

    res.status(200).json({
      success: true,
      data: result,
      message: "Connection request approved successfully",
    });
  }

  async rejectConnectionRequest(req: Request, res: Response): Promise<void> {
    const user = this.getUser(req);
    const requestId = req.params.requestId as string;
    const rejectionReason = req.body?.rejectionReason as string | undefined;

    if (!requestId) {
      throw new ValidationError("requestId is required");
    }

    const result = await this.displayService.rejectConnectionRequest(
      requestId,
      user.id,
      rejectionReason
    );

    res.status(200).json({
      success: true,
      data: result,
      message: "Connection request rejected successfully",
    });
  }
}

export default DisplayController;
