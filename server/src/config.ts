import { handleMcpRequest as handle_2025_11_25 } from "./versions/2025-11-25/index.js";

// MCPサーバの情報
export const SERVER_INFO = {
  name: "weather",
  version: "0.1.0",
  description: "Sample MCP Server with Stateless and Streamable HTTP and non SSE",
};

// MCPプロトコルのバージョン（JSONRPCのメソッドに書く値が変わるイメージ）
export const SUPPORTED_MCP_VERSIONS = ["2025-11-25"];
export type SupportedMcpVersion = typeof SUPPORTED_MCP_VERSIONS[number];
export const VERSION_HANDLERS: Record<SupportedMcpVersion, any> = {
  "2025-11-25": handle_2025_11_25
};

// エンドポイント
export const PORT = Number(process.env.PORT) || 8080;
export const HOST = process.env.HOST || "127.0.0.1";
