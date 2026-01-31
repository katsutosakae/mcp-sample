import { McpClient } from "../../mcpClient.js";
import { MCP_CLIENTS, MCP_SERVERS, McpClientId, McpServerId } from "../../config.js";
import { Method, ToolSchema } from "./types.js";

export async function createMcpClientForVersion(clientId: McpClientId, serverId: McpServerId, version: string): Promise<McpClient<Method> | null> {
  const url = MCP_SERVERS[serverId].url;
  const clientInfo = MCP_CLIENTS[clientId];

  const client = new McpClient<Method>({ clientId, serverId, url, version });

  const response = await client.initialize("initialize", {
    protocolVersion: "2025-11-25",
    capabilities: {},
    clientInfo
  });
  if (!response?.error && response?.result?.protocolVersion) {
    await client.notification("notifications/initialized");
    return client;
  }

  return null;
}