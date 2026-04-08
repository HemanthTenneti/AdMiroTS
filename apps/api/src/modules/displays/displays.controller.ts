/**
 * Display Controller
 * Handles HTTP requests for display operations
 * Routes requests to service layer and formats responses
 */
import { Request, Response } from "express";
import DisplayService from "./displays.service";
import { AuthenticatedRequest } from "../../types/auth.types";
import { UnauthorizedError, ValidationError } from "../../utils/errors/index";
import { SuccessResponse } from "@admiro/shared";

export class DisplayController {
  private displayService: DisplayService;

  constructor() {
    this.displayService = new DisplayService();
  }

  /**
   * Helper to extract authenticated user from request
   * Throws UnauthorizedError if user is not authenticated
   */
  private getUser(req: Request): any {
    const authReq = req as Request & AuthenticatedRequest;
    if (!authReq.user) {
      throw new UnauthorizedError("User not authenticated");
    }
    return authReq.user;
  }

  /**
   * POST /api/displays
   * Create a new display
   */
  async createDisplay(req: Request, res: Response): Promise<void> {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/displays
   * List all displays with pagination and filters
   */
  async listDisplays(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, status, location, layout, sortBy, sortOrder } = req.query;

      const result = await this.displayService.listDisplays(
        Number(page) || 1,
        Number(limit) || 10,
        {
          status: typeof status === "string" ? status : undefined,
          location: typeof location === "string" ? location : undefined,
          layout: typeof layout === "string" ? layout : undefined,
          sortBy: typeof sortBy === "string" ? sortBy : undefined,
          sortOrder: (sortOrder as "asc" | "desc") || undefined,
        }
      );

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
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/displays/:id
   * Get a specific display by ID
   */
  async getDisplay(req: Request, res: Response): Promise<void> {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT /api/displays/:id
   * Update a display's properties
   */
  async updateDisplay(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        throw new ValidationError("Display ID is required");
      }
      const display = await this.displayService.updateDisplay(id, req.body);

      const response: SuccessResponse<any> = {
        success: true,
        data: display,
      };
      res.status(200).json(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE /api/displays/:id
   * Delete (soft-delete) a display
   */
  async deleteDisplay(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        throw new ValidationError("Display ID is required");
      }
      await this.displayService.deleteDisplay(id);

      const response: SuccessResponse<any> = {
        success: true,
        data: { message: "Display deleted successfully" },
      };
      res.status(200).json(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/displays/:id/status
   * Get display status and online/offline information
   */
  async getDisplayStatus(req: Request, res: Response): Promise<void> {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /api/displays/:id/ping
   * Record a heartbeat/ping from a display
   */
  async pingDisplay(req: Request, res: Response): Promise<void> {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/displays/:id/loops
   * Get loops assigned to a display
   */
  async getAssignedLoops(req: Request, res: Response): Promise<void> {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /api/displays/pair
   * Complete display pairing (setup process)
   */
  async pairDisplay(req: Request, res: Response): Promise<void> {
    try {
      const { serialNumber } = req.body;
      const display = await this.displayService.pairDisplay(serialNumber);

      const response: SuccessResponse<any> = {
        success: true,
        data: display,
      };
      res.status(201).json(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /api/displays/:id/config
   * Update display configuration
   */
  async updateDisplayConfig(req: Request, res: Response): Promise<void> {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/displays/location/:location
   * Get all displays at a specific location
   */
  async getDisplaysByLocation(req: Request, res: Response): Promise<void> {
    try {
      const location = Array.isArray(req.params.location) ? req.params.location[0] : req.params.location;
      if (!location) {
        throw new ValidationError("Location is required");
      }
      const displays = await this.displayService.getDisplaysByLocation(location);

      const response: SuccessResponse<any> = {
        success: true,
        data: displays,
      };
      res.status(200).json(response);
    } catch (error) {
      throw error;
    }
  }
}

export default DisplayController;

