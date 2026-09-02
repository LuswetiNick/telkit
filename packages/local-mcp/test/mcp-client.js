import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { writeFileSync } from "node:fs";

const [operation, bunExecutable, serverEntryPath, coreOutcome] =
  process.argv.slice(2);
const serverEnvironment = {
  NO_COLOR: "1",
};

if (coreOutcome) {
  serverEnvironment.TELEGRAM_BOT_TOKEN = "test-bot-token";
  serverEnvironment.TELKIT_TEST_CORE_OUTCOME = coreOutcome;
}

const transport = new StdioClientTransport({
  command: bunExecutable,
  args: ["run", "--no-env-file", "--no-install", serverEntryPath],
  cwd: process.cwd(),
  env: serverEnvironment,
  stderr: "pipe",
});
const client = new Client({
  name: "telkit-local-mcp-test",
  version: "0.0.0",
});

try {
  await client.connect(transport);

  let result;

  switch (operation) {
    case "initialize":
      result = client.getServerVersion();
      break;
    case "list-tools":
      result = await client.listTools();
      break;
    case "call-telegram":
      result = await client.callTool({
        name: "telegram",
        arguments: {
          chatId: "fake-chat-id",
          message: "Fake message",
        },
      });
      break;
    default:
      throw new Error(`Unsupported MCP test operation: ${operation}`);
  }

  writeFileSync(process.stdout.fd, JSON.stringify(result));
} finally {
  await client.close().catch(() => undefined);
  await transport.close();
}
