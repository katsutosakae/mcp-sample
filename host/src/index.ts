import * as readline from "readline";
import { SUPPORTED_MCP_VERSIONS, VERSION_MODULES } from "./config.js";

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


const SYSTEM_PROMPT = `
You are a Japanese assistant.

ABSOLUTE RULES:
- You MUST respond in Japanese only.
`;

function getUserPrompt(result: string, userPrompt: string) {
  return `
You will be given:
1) A list of API result
2) A user request

Answer user request with API result.
Do not mention that you are referring to the API results.

API Result (JSON):
${result}

User request:
${userPrompt}
`;
}

const SYSTEM_PROMPT_FOR_TOOL_SELECTION = `
You are a tool-routing assistant.

ABSOLUTE RULES:
- You MUST respond in Japanese only.
- Output MUST be a single valid JSON object.
- Do NOT use Markdown.
- Do NOT use code fences or triple backticks.
- The first character MUST be "{" and the last character MUST be "}".
- Do NOT include any text outside the JSON object.
`;

function getUserPromptForToolSelection(toolsText: string, userPrompt: string) {
  return `
You will be given:
1) A list of available tools (JSON)
2) A user request

Decide whether a tool is needed.

Rules:
- Use a tool only if it materially improves correctness or usefulness.
- If multiple tools could work, pick exactly ONE.
- Never invent tools or parameters.
- If required parameters are missing, ask ONE concise follow-up question.

Output format (JSON only):

Tool call:
{
  "type": "tool_call",
  "tool": "<tool_name>",
  "arguments": { },
  "reason": "<short reason>"
}

Direct answer:
{
  "type": "direct_answer",
  "answer": "<answer>",
  "reason": "<short reason>"
}

Tools (JSON):
${toolsText}

User request:
${userPrompt}
`;
}

function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model output");
  }
  return text.slice(start, end + 1).trim();
}

async function askLlm(prompt: string, isToolSelection : boolean) {
  const res = await fetch(`${process.env.ANTHROPIC_ENDPOINT}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${process.env.ANTHROPIC_API_KEY}`,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      "model": "claude-sonnet-4-5",
      "max_tokens": 1000,
      "system" : isToolSelection ? SYSTEM_PROMPT_FOR_TOOL_SELECTION : SYSTEM_PROMPT,
      "messages": [
        {
          "role": "user",
          "content": prompt
        }
      ]
    }),
  });

  if (!res.ok) {
    throw new Error("Can't fetch LLM");
  }
  return await res.json();
}


async function main() {
  try {
    // initialize
    for (const version of SUPPORTED_MCP_VERSIONS) {
      const versionModule = VERSION_MODULES[version];
      if (!versionModule) continue;
      const client = await versionModule.createMcpClientForVersion("weather", "weather", version)
      if (!client) continue;

      // listtools
      const toolsResponse = await client.request("tools/list");
      const tools = toolsResponse?.result?.tools ?? [];
      const toolsText = JSON.stringify(tools, null, 2)

      // Ask Tool
      console.log("##################################################################");
      const userPrompt = await prompt("# 質問してみましょう\n");
      console.log("\n##################################################################\n");
      const llmToolSelectionResponse = await askLlm(getUserPromptForToolSelection(toolsText, userPrompt), true)
      const llmToolSelectionAnswerText = llmToolSelectionResponse?.content[0]?.text
      const llmToolSelectionAnswer = JSON.parse(extractJsonObject(llmToolSelectionAnswerText))
      if (llmToolSelectionAnswer.type === "direct_answer") {
        console.log(llmToolSelectionAnswer?.answer)
        process.exit(1);
      }

      // calltool
      const weatherResponse = await client.request("tools/call", {
        name: llmToolSelectionAnswer?.tool,
        arguments: llmToolSelectionAnswer?.arguments
      });

      // Ask answer
      const llmResponse = await askLlm(getUserPrompt(JSON.stringify(weatherResponse?.result, null, 2), userPrompt), false)
      const llmAnswerText = llmResponse?.content[0]?.text
      console.log(llmAnswerText);

      process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
