export type Method = "initialize" | "notifications/initialized" | "tools/list" | "tools/call"

export type ToolSchema = {
  name: string;
  description: string;
  inputSchema: any;
};
