/**
 * Shared types package for AdMiro
 * Provides DTOs, interfaces, and constants used across frontend and backend
 */
// Re-export all DTOs from types module
export * from "./types/index.js";
/**
 * Application workflow modules
 * Defines the main sections of the application
 */
export const WORKFLOW_MODULES = [
    { key: "auth", title: "Authentication" },
    { key: "advertisements", title: "Advertisement Management" },
    { key: "displays", title: "Display Management" },
    { key: "display-loops", title: "Display Loop Management" },
    { key: "analytics", title: "Analytics" },
    { key: "system-logs", title: "System Logs" },
    { key: "profile", title: "Profile Management" },
];
