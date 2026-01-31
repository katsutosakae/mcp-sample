import express from "express";
import { SERVER_INFO, SUPPORTED_MCP_VERSIONS, VERSION_HANDLERS, PORT, HOST } from "./config.js";
import { isJsonRpcRequest, jsonRpcResultResponse, jsonRpcErrorResponse } from "./jsonrpc.js";

/*
実装方針
- セッション無し、ステートレス
- Toolsのみ、Prommpt, Resource無し
- Server-Sent Events(SSE)無し、application/jsonのみ対応
*/

function isSupportedMcpVersion(clientVersion: string): boolean {
  return SUPPORTED_MCP_VERSIONS.includes(clientVersion);
}

const app = express();
app.use(express.json({ type: ["application/json"] }));
app.get("/mcp", (_req, res) => {
  res.status(405).send("SSE not supported");
});
app.post("/mcp", async (req, res) => {
  const msg = req.body;

  if (!isJsonRpcRequest(msg)) {
    return res.status(400).json({ error: "Invalid JSON-RPC message" });
  }

  // MCPバージョン共通処理
  const isNotification = msg.id === undefined;

  //// initialize処理
  if (msg.method === "initialize") {
    if (isNotification) {
      return res.status(400).json(
        jsonRpcErrorResponse(msg.id, -32602, "initialize must be a request with id" )
      );
    }

    const clientMcpVersion = msg.params?.protocolVersion;
    if (!clientMcpVersion) {
      return res.status(400).json(jsonRpcErrorResponse(msg.id, -32602, "Missing params.protocolVersion"));
    }
    if (!isSupportedMcpVersion(clientMcpVersion)) {
      return res.status(400).json(
        jsonRpcErrorResponse(msg.id, -32602, `Unsupported protocol version: ${clientMcpVersion}`, { supported: SUPPORTED_MCP_VERSIONS })
      );
    }

    return res.status(200).type("application/json").json(
      jsonRpcResultResponse(msg.id, {
        protocolVersion: clientMcpVersion,
        capabilities: {
          tools: {
            listChanged: false
          }
        },
        serverInfo: SERVER_INFO,
      })
    );
  }
  //// notifications/initialized処理
  if (msg.method === "notifications/initialized") {
    return res.status(202).end();
  }
  //// その他 Notification
  if (isNotification) {
    return res.status(202).end();
  }


  // MCPバージョン毎の処理
  const clientMcpVersion = req.header("MCP-Protocol-Version");
  if (!clientMcpVersion) {
    return res.status(400).json(jsonRpcErrorResponse(msg.id, -32000, "Missing MCP-Protocol-Version header"));
  }
  if (!isSupportedMcpVersion(clientMcpVersion)) {
    return res.status(400).json(
      jsonRpcErrorResponse(msg.id, -32000, `Unsupported protocol version: ${clientMcpVersion}`, { supported: SUPPORTED_MCP_VERSIONS })
    );
  }
  //// Toolsの分岐
  const handler = VERSION_HANDLERS[clientMcpVersion];
  if (!handler) {
    return res.status(500).json(jsonRpcErrorResponse(msg.id, -32001, "Version handler missing"));
  }
  return handler(req, res);
});

app.listen(PORT, HOST, () => {
  console.log(`MCP server listening on http://${HOST}:${PORT}/mcp`);
});
