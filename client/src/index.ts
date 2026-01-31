import * as readline from "readline";
import { createMcpClient } from "./mcpClientFactory.js";

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  try {
    const client = await createMcpClient("sample-mcp-http-server");
    console.log(`MCP Server : ${client.getId()} \nMCP Version: ${client.getProtocolVersion()}`);
    
    const toolsResponse = await client.request("tools/list");
    const tools = toolsResponse?.result?.tools ?? [];
    console.log(`Tools: ${JSON.stringify(tools.map((tool : any)=>tool.name), null, 2)} \n`);

    const userInput = await prompt("Enter your request: ");

    // TODO: LLMにツール一覧とユーザー入力を送信してツール選定
    // const llmResponse = await fetch("...", { ... });
    // const selectedTool = llmResponse.tool;
    // const toolArgs = llmResponse.arguments;

    const weatherResponse = await client.request("tools/call", {
      name: "get_weather",
      arguments: { latitude: 40.7128, longitude: -74.006 },
    });
    console.log("Result:", JSON.stringify(weatherResponse?.result, null, 2));

    // TODO: LLMにツール結果を送信して最終回答を生成
    // const finalResponse = await fetch("...", { ... });
    // console.log("Final answer:", finalResponse.answer);

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
