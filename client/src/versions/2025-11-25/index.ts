export const methods = {
  initialize: "initialize",
  notifyInitialized: "notifications/initialized",
  listTools: "tools/list",
  callTool: "tools/call",
} as const

export function getInitializeParams(clientInfo: any) {
  return {
    protocolVersion: "2025-11-25",
    capabilities: {},
    clientInfo
  }
}
