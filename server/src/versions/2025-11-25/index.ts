import type { Request, Response } from "express";
import { jsonRpcResultResponse, jsonRpcErrorResponse } from "../../jsonrpc.js";
import { tools } from "./tools/index.js";

export async function handleMcpRequest(req: Request, res: Response) {
  const msg = req.body;

  try {
    // メソッド毎の処理
    switch (msg.method) {
      case "tools/list": {
        const toolList = Object.values(tools).map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        }));
        return res.status(200).type("application/json").json(
          jsonRpcResultResponse(msg.id, { tools: toolList })
        );
      }

      case "tools/call": {
        const toolName = msg.params?.name;
        const input = msg.params?.arguments;
        if (!toolName) {
          return res.status(200).json(jsonRpcErrorResponse(msg.id!, -32602, "Missing params.name"));
        }
        const tool = tools[toolName];
        if (!tool) {
          return res.status(200).json(jsonRpcErrorResponse(msg.id!, -32602, `Unknown tool: ${toolName}`));
        }
        const result = await tool.handler(input ?? {});
        return res.status(200).type("application/json").json(jsonRpcResultResponse(msg.id, result));
      }

      default: {
        return res.status(200).json(jsonRpcErrorResponse(msg.id!, -32601, `Method not found: ${msg.method}`));
      }
    }
  } catch (error: any) {
    console.error(error instanceof Error ? error.message : error);
    return res.status(500).json(jsonRpcErrorResponse(msg.id!, -32603, "Internal error"));
  }
}
