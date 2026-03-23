export type UserRole = "admin" | "advertiser";

export interface WorkflowModule {
  key: string;
  title: string;
}

export const WORKFLOW_MODULES: WorkflowModule[] = [
  { key: "auth", title: "Authentication" },
  { key: "advertisements", title: "Advertisement Management" },
  { key: "displays", title: "Display Management" },
  { key: "display-loops", title: "Display Loop Management" },
  { key: "analytics", title: "Analytics" },
  { key: "system-logs", title: "System Logs" },
  { key: "profile", title: "Profile Management" }
];
