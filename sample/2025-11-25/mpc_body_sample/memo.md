https://modelcontextprotocol.io/specification/2025-11-25/basic/transports

https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#sending-messages-to-the-server
accepted : 202 https://developer.mozilla.org/ja/docs/Web/HTTP/Reference/Status/202
他は200でいいかな
denied : 400-

https://modelcontextprotocol.io/specification/2025-11-25/server/tools
今回はtoolsだけを実装
パラメータも最小限

https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
 Server-Sent Events (SSE) も無し
 ということで、クライアントはAcceptにapplication/jsonだけにしておく。

https://www.jsonrpc.org/specification_v1#a1.3Notification
notificatoinの時はID null必須

https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#session-management
セッションも無し：セッションやれば初期化コストが下がり、テートフルにできるが、実装コスト有、やる場合はセッションハイジャック対策重要
けどステートレスでも簡単に実装はできるのでいったんおｋ
⇒セッション破棄の処理も無し
けど毎回ＭＣＰバージョン送らないと
⇒ヘッダに乗せろって書いてある　https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#protocol-version-header

未対応バージョンきたら400Bad https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#protocol-version-header


今回ページネーション用のboduyは無しで行く
cursor
// https://modelcontextprotocol.io/specification/2025-11-25/server/tools
// https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/pagination


バージョンは以下のだけど、最新の2025-11-25にする
https://github.com/modelcontextprotocol/modelcontextprotocol/tree/main/schema

テスト用のcurl

curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -d @1_req_initialization.json
curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -d @1_req_initialization_unsupported_version.json
curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -d @1_req_initialization_no_id.json

curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -d @2_req_initialized.json

curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -H "MCP-Protocol-Version: 2025-11-25" -d @3_req_tools_list.json

curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -H "MCP-Protocol-Version: 2025-11-25" -d @4_req_tools_call.json
curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -H "MCP-Protocol-Version: 2025-11-25" -d @4_req_tools_call_tool_error.json
curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -H "MCP-Protocol-Version: 2025-11-25" -d @4_req_tools_call_no_tool.json

curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -H "MCP-Protocol-Version: 2025-03-26" -d @5_req_unsupported_method.json
curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -H "MCP-Protocol-Version: 2025-11-25" -d @5_req_unsupported_method.json
