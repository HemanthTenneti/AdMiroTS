/**
 * Shared types package for AdMiro
 * Provides DTOs, interfaces, and constants used across frontend and backend
 */

// Re-export all DTOs from types module
export * from "./types/index";
export * from "./schemas/index";

// Legacy type - kept for backward compatibility
// Use UserRole from @admiro/domain instead
export type UserRole = "admin" | "advertiser";

/**
 * Workflow module definition
 * Defines available modules in the application navigation
 */
export interface WorkflowModule {
  key: string;
  title: string;
}

/**
 * Application workflow modules
 * Defines the main sections of the application
 */
export const WORKFLOW_MODULES: WorkflowModule[] = [
  { key: "auth", title: "Authentication" },
  { key: "advertisements", title: "Advertisement Management" },
  { key: "displays", title: "Display Management" },
  { key: "display-loops", title: "Display Loop Management" },
  { key: "analytics", title: "Analytics" },
  { key: "system-logs", title: "System Logs" },
  { key: "profile", title: "Profile Management" },
];
