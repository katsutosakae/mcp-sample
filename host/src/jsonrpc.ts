// JSON-RPC 2.0 Schema
export type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: string | number;
  method: string;
  params?: any;
};

export type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
};

// JSON-RPC Request Builder
let requestId = 0;

export function jsonRpcRequest(method: string, params?: any): JsonRpcRequest {
  return {
    jsonrpc: "2.0",
    id: ++requestId,
    method,
    params,
  };
}

export function jsonRpcNotificationRequest(method: string, params?: any): JsonRpcRequest {
  return {
    jsonrpc: "2.0",
    method,
    params,
  };
}

export function isJsonRpcResponse(msg: any): boolean {
  return msg && msg.jsonrpc === "2.0";
}

// Fetch (JSON-RPC)
export async function sendRequest(url: string, request: JsonRpcRequest, headers: Record<string, string> = {}): Promise<JsonRpcResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    body: JSON.stringify(request),
  });

  const msg = await res.json();

  if (!isJsonRpcResponse(msg)) {
    throw new Error("Not JSON-RPC Response");
  }

  return msg;
}

export async function sendNotification(url: string, request: JsonRpcRequest, headers: Record<string, string> = {}): Promise<void> {
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    body: JSON.stringify(request),
  });
}
