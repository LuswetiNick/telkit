import { describe, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";

const serverEntryPath = fileURLToPath(
  new URL("../src/index.ts", import.meta.url),
);
const clientHelperPath = fileURLToPath(
  new URL("./mcp-client.js", import.meta.url),
);
const testDirectory = fileURLToPath(new URL(".", import.meta.url));
// The installed SDK's stdio client transport is Node-only.
const nodeExecutable = Bun.which("node");

async function runMcpClient(operation) {
  if (!nodeExecutable) {
    throw new Error("The MCP SDK stdio client requires Node.js");
  }

  const child = Bun.spawn(
    [
      nodeExecutable,
      clientHelperPath,
      operation,
      process.execPath,
      serverEntryPath,
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
});
