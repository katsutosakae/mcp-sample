import { McpServerId, MCP_SERVERS, SUPPORTED_MCP_VERSIONS, VERSION_MODULES, MCP_CLIENTS, McpClientId } from "./config.js";
import { McpClient } from "./mcpClient.js";

export async function createMcpClient(clientId: McpClientId, serverId: McpServerId): Promise<McpClient> {
  const url = MCP_SERVERS[serverId].url;
  const clientInfo = MCP_CLIENTS[clientId];

  for (const version of SUPPORTED_MCP_VERSIONS) {
    const versionModule = VERSION_MODULES[version];
    if (!versionModule) continue;

    const client = new McpClient({ serverId, url, version });

    const response = await client.initialize(
      versionModule.methods.initialize,
      versionModule.getInitializeParams(clientInfo)
    );

    if (!response?.error && response?.result?.protocolVersion) {
      await client.notification(versionModule.methods.notifyInitialized);
      return client;
    }
  }

  throw new Error("MCP version negotiation failed: no supported version found");
}
