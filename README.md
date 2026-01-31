# MCP Sample Server

MCP (Model Context Protocol) のサンプル実装です。
自然言語でアメリカの都市名の天気を質問すると、具体的に返してくれるようにします。

## 概要

- **プロトコルバージョン**: 2025-11-25
- **トランスポート**: HTTP (JSON-RPC 2.0)
- **セッション**: セッション管理せず、ステートレスに実装
- **実装範囲**
  - MCPホスト：内部に複数MCPクライアントを想定
  - MCPサーバ：Tools のみ（最小限のパラメータ）、PrommptとResource無し
- **その他**
  - バージョン拡張しやすいように実装
  - AIにはClaude APIを使用
  - 自力実装することが目的なので、mcpやanthropic提供のライブラリ系は使用せずに頑張ります

## ディレクトリ構成

```
.
├── host/          # MCPホスト（クライアント実装）
│   └── src/
├── server/        # MCPサーバ実装
│   └── src/
└── sample/        # サンプルデータ
    ├── jsonrpc_2_0/           # JSON-RPC 2.0 サンプル
    └── 2025-11-25/            # MCP プロトコルサンプル
```

## 設計方針

### JSON-RPC

- [ドキュメント](https://www.jsonrpc.org/specification)
- id の有無で Notification を判断
- サンプル: `./sample/jsonrpc_2_0/`

### トランスポート

- Server-Sent Events (SSE) は未対応
- クライアントヘッダ
  - `Accept`: `application/json` のみ
  - `MCP-Protocol-Version`: プロトコルバージョンを送信（initialize 以外）
- サンプル: `./sample/2025-11-25/mcp_body_sample/`

### HTTPステータスコード

| 状態   | ステータスコード | 備考                            |
| ------ | ---------------- | ------------------------------- |
| 受理   | 202 Accepted     | Notification のみ（GET）        |
| 成功   | 200 OK           | Notification 以外の処理（POST） |
| エラー | 400 Bad Request  | 未対応バージョン、その他エラー  |

### その他 MCP実装のポイント

- **Notification**: id フィールドを省略 ([JSON-RPC 2.0 仕様](https://www.jsonrpc.org/specification))
- **ページネーション**: 未対応（cursor なし）
- **セッション実装時の考慮点**: 初期化コスト削減、ステートフル対応可能（要セッションハイジャック対策）

## 参考リンク

- [MCP Transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- [MCP Tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- [MCP Pagination](https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/pagination)
- [MCP Session Management](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#session-management)
- [MCP Protocol Version Header](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#protocol-version-header)
- [MCP Schema (GitHub)](https://github.com/modelcontextprotocol/modelcontextprotocol/tree/main/schema)
- [HTTP 202 Accepted](https://developer.mozilla.org/ja/docs/Web/HTTP/Reference/Status/202)

## Claudeのセットアップ
- [Get Started](https://platform.claude.com/docs/en/get-started)
- [Claude Console](https://platform.claude.com/settings/keys)からAPI Keyを発行
- 最低5$を入金
- 以下のAPIコールを参考に、TypeScriptからfetchを行う

```bash
curl https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-5",
    "max_tokens": 1000,
    "messages": [
      {
        "role": "user", 
        "content": "What should I search for to find the latest developments in renewable energy?"
      }
    ]
  }'
```



## テスト用 curl コマンド

### 初期化

```bash
cd <リポジトリパス>/sample

# 初期化リクエスト
curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -d @1_req_initialization.json

# initialized 通知
curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -d @2_req_initialized.json
```

### Tools

```bash
# ツール一覧取得
curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -H "MCP-Protocol-Version: 2025-11-25" -d @3_req_tools_list.json

# ツール実行
curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -H "MCP-Protocol-Version: 2025-11-25" -d @4_req_tools_call.json
```

### エラーケース

```bash
# 初期化リクエスト（未対応バージョン）
curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -d @1_req_initialization_unsupported_version.json

# 初期化リクエスト（ID なし）
curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -d @1_req_initialization_no_id.json

# ツール実行（エラーケース）
curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -H "MCP-Protocol-Version: 2025-11-25" -d @4_req_tools_call_tool_error.json

# ツール実行（存在しないツール）
curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -H "MCP-Protocol-Version: 2025-11-25" -d @4_req_tools_call_no_tool.json

# 未対応メソッド（古いバージョン）
curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -H "MCP-Protocol-Version: 2025-03-26" -d @5_req_unsupported_method.json

# 未対応メソッド（現行バージョン）
curl -X POST http://localhost:8080/mcp -H "Content-Type: application/json" -H "MCP-Protocol-Version: 2025-11-25" -d @5_req_unsupported_method.json
```