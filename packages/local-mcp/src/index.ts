import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { sendTelegramMessage, telegramMessageInputSchema } from "telkit-core";

const server = new McpServer({
  name: "telkit-local",
  version: "0.0.0",
});

function getTelegramBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN is not defined. Configure it in your MCP client environment.",
    );
  }
  return token;
}

server.registerTool(
  "telegram",
  {
    title: "Telegram",
    description: "Send a text message to a Telegram chat.",
    inputSchema: telegramMessageInputSchema.shape,
  },
  async (input) => {
    const result = await sendTelegramMessage({
      ...input,
      botToken: getTelegramBotToken(),
    });
    return {
      content: [
        {
          type: "text",
          text: `Sent Telegram message to chat ${result.chatId} with message ID ${result.messageId}.`,
        },
      ],
      structuredContent: result,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
