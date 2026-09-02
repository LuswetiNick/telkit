import { describe, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";

const serverEntryPath = fileURLToPath(
  new URL("../src/index.ts", import.meta.url),
);
const clientHelperPath = fileURLToPath(
  new URL("./mcp-client.js", import.meta.url),
);
const mockCoreEntryPath = fileURLToPath(
  new URL("./mock-core-entry.js", import.meta.url),
);
const testDirectory = fileURLToPath(new URL(".", import.meta.url));
// The installed SDK's stdio client transport is Node-only.
const nodeExecutable = Bun.which("node");

async function runMcpClient(
  operation,
  { coreOutcome, entryPath = serverEntryPath } = {},
) {
  if (!nodeExecutable) {
    throw new Error("The MCP SDK stdio client requires Node.js");
  }

  const child = Bun.spawn(
    [
      nodeExecutable,
      clientHelperPath,
      operation,
      process.execPath,
      entryPath,
      coreOutcome ?? "",
    ],
    {
      cwd: testDirectory,
      env: {
        NO_COLOR: "1",
      },
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);

  if (exitCode !== 0) {
    throw new Error(
      `MCP client helper exited with code ${exitCode}: ${stderr.trim()}`,
    );
  }

  return JSON.parse(stdout);
}

describe("telkit local MCP stdio server", () => {
  test("initializes through the official MCP client", async () => {
    expect(await runMcpClient("initialize")).toEqual({
      name: "telkit-local",
      version: "0.0.0",
    });
  });

  test("discovers the telegram tool and its public input schema", async () => {
    const result = await runMcpClient("list-tools");
    const telegramTool = result.tools.find((tool) => tool.name === "telegram");

    expect(telegramTool).toBeDefined();
    expect(telegramTool.inputSchema.properties).toHaveProperty("chatId");
    expect(telegramTool.inputSchema.properties).toHaveProperty("message");
    expect(telegramTool.inputSchema.required).toEqual(
      expect.arrayContaining(["chatId", "message"]),
    );
    expect(telegramTool.inputSchema.properties).not.toHaveProperty("botToken");
  });

  test("returns a safe tool error when the bot token is absent", async () => {
    const result = await runMcpClient("call-telegram");
    const errorText = result.content
      .filter((content) => content.type === "text")
      .map((content) => content.text)
      .join("\n");

    expect(result.isError).toBe(true);
    expect(errorText).toContain("TELEGRAM_BOT_TOKEN is not defined");
    expect(errorText).not.toContain("api.telegram.org");
    expect(errorText).not.toContain("/bot");
  });

  test("maps a successful core result to an MCP tool result", async () => {
    const result = await runMcpClient("call-telegram", {
      coreOutcome: "success",
      entryPath: mockCoreEntryPath,
    });
    const resultText = result.content
      .filter((content) => content.type === "text")
      .map((content) => content.text)
      .join("\n");

    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toEqual({
      ok: true,
      chatId: "fake-chat-id",
      messageId: 42,
    });
    expect(resultText).toContain(
      "Sent Telegram message to chat fake-chat-id with message ID 42",
    );
    expect(JSON.stringify(result)).not.toContain("test-bot-token");
    expect(JSON.stringify(result)).not.toContain("api.telegram.org");
  });

  test("maps a core failure to a safe MCP tool error", async () => {
    const result = await runMcpClient("call-telegram", {
      coreOutcome: "failure",
      entryPath: mockCoreEntryPath,
    });
    const errorText = result.content
      .filter((content) => content.type === "text")
      .map((content) => content.text)
      .join("\n");

    expect(result.isError).toBe(true);
    expect(errorText).toContain("Synthetic core failure");
    expect(errorText).not.toContain("test-bot-token");
    expect(errorText).not.toContain("api.telegram.org");
  });
});
