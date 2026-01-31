import * as v2025_11_25 from "./versions/2025-11-25/index.js";

// MCPホスト単位のバージョン情報（JSONRPCのメソッドに書く値が変わるイメージ）
export const SUPPORTED_MCP_VERSIONS = ["2025-11-25"];
export type SupportedMcpVersion = typeof SUPPORTED_MCP_VERSIONS[number];
export const VERSION_MODULES: Record<SupportedMcpVersion, any> = {
  "2025-11-25": v2025_11_25
};

// MCPホスト内のMCPクライアント一覧
export const MCP_CLIENTS = {
  "weather": {
    name: "weather",
    version: "0.1.0",
    description: "Weather MCP Client with Stateless and Streamable HTTP and non SSE",
  }
} as const;
export type McpClientId = keyof typeof MCP_CLIENTS;

// MCPサーバ一覧
export const MCP_SERVERS = {
  "weather": {
    url: "http://127.0.0.1:8080/mcp"
  }
}
export type McpServerId = keyof typeof MCP_SERVERS;
