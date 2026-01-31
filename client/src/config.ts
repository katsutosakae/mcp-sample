import * as v2025_11_25 from "./versions/2025-11-25/index.js";

// MCPクライアント情報
export const CLIENT_INFO = {
  name: "sample-mcp-http-client",
  version: "0.1.0",
  description: "Sample MCP Client with Stateless and Streamable HTTP and non SSE",
};

// MCPクライアントのバージョン情報
export const SUPPORTED_MCP_VERSIONS = ["2025-03-26", "2025-11-25"];
export type SupportedMcpVersion = typeof SUPPORTED_MCP_VERSIONS[number];
export const VERSION_MODULES: Record<SupportedMcpVersion, any> = {
  "2025-11-25": v2025_11_25,
  "2025-03-26": null
};

// MCPサーバ一覧
export const MCP_SERVERS = {
  "sample-mcp-http-server": {
    url: "http://127.0.0.1:8080/mcp"
  }
}
export type McpServerId = keyof typeof MCP_SERVERS;
