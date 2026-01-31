import { McpServerId } from "./config.js";
import type { JsonRpcResponse } from "./jsonrpc.js";
import { jsonRpcRequest, jsonRpcNotificationRequest, sendRequest, sendNotification } from "./jsonrpc.js";

export type McpClientOptions = {
  serverId: McpServerId;
  url: string;
  version: string;
};

export class McpClient {
  private id: string;
  protected url: string;
  protected version: string;

  constructor(params: McpClientOptions) {
    this.id = params.serverId;
    this.url = params.url;
    this.version = params.version;
  }

  public getId(): string {
    return this.id;
  }

  public getServerUrl(): string {
    return this.url;
  }

  public getProtocolVersion(): string {
    return this.version;
  }

  public async initialize(method: string, params: Record<string, any>): Promise<JsonRpcResponse> {
    const req = jsonRpcRequest(method, params);
    return sendRequest(this.url, req);
  }

  public async request(method: string, params?: Record<string, any>): Promise<JsonRpcResponse> {
    const req = jsonRpcRequest(method, params);
    return sendRequest(this.url, req, {
      "MCP-Protocol-Version": this.version,
    });
  }
  public async notification(method: string, params?: Record<string, any>): Promise<void> {
    const req = jsonRpcNotificationRequest(method, params);
    await sendNotification(this.url, req, {
      "MCP-Protocol-Version": this.version,
    });
  }
}
