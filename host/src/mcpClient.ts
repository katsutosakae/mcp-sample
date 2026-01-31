import { McpClientId, McpServerId } from "./config.js";
import type { JsonRpcResponse } from "./jsonrpc.js";
import { jsonRpcRequest, jsonRpcNotificationRequest, sendRequest, sendNotification } from "./jsonrpc.js";

export type McpClientOptions = {
  clientId: McpClientId;
  serverId: McpServerId;
  url: string;
  version: string;
};

export class McpClient<T extends string> {
  private clientId: McpClientId;
  private serverId: McpServerId;
  private url: string;
  private version: string;

  constructor(params: McpClientOptions) {
    this.clientId = params.clientId;
    this.serverId = params.serverId;
    this.url = params.url;
    this.version = params.version;
  }

  public getClientId(): string {
    return this.clientId;
  }

  public getServerId(): string {
    return this.serverId;
  }

  public getServerUrl(): string {
    return this.url;
  }

  public getProtocolVersion(): string {
    return this.version;
  }

  public async initialize(method: T, params: Record<string, any>): Promise<JsonRpcResponse> {
    const req = jsonRpcRequest(method, params);
    return sendRequest(this.url, req);
  }

  public async request(method: T, params?: Record<string, any>): Promise<JsonRpcResponse> {
    const req = jsonRpcRequest(method, params);
    return sendRequest(this.url, req, {
      "MCP-Protocol-Version": this.version,
    });
  }
  public async notification(method: T, params?: Record<string, any>): Promise<void> {
    const req = jsonRpcNotificationRequest(method, params);
    await sendNotification(this.url, req, {
      "MCP-Protocol-Version": this.version,
    });
  }
}
