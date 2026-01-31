// JSON-RPC 2.0
// https://www.jsonrpc.org/specification_v1
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

export function isJsonRpcRequest(msg: any): boolean {
  return msg && msg.jsonrpc === "2.0" && typeof msg.method === "string";
}
export function jsonRpcResultResponse(id: string | number, result: any): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}
export function jsonRpcErrorResponse(id: string | number, code: number, message: string, data?: any): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message, data } };
}