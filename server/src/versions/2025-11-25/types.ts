// MCP 2025-11-25 
// https://modelcontextprotocol.io/specification/2025-11-25/server/tools
type ToolSchema = {
  name: string;
  description: string;
  inputSchema: any;
};
export type ToolDef = {
  handler: (input: any) => Promise<ToolResult>;
} & ToolSchema;

export type ToolResult = {
  content: Array<{ type: string; text: string }>;
};
