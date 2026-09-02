import { mock } from "bun:test";
import { telegramMessageInputSchema } from "../../core/src/schemas/schemas.ts";

const coreOutcome = process.env.TELKIT_TEST_CORE_OUTCOME;

mock.module("telkit-core", () => ({
  telegramMessageInputSchema,
  sendTelegramMessage: async ({ chatId, message, botToken }) => {
    if (
      chatId !== "fake-chat-id" ||
      message !== "Fake message" ||
      botToken !== "test-bot-token"
    ) {
      throw new Error("Local MCP passed unexpected input to telkit-core");
    }

    if (coreOutcome === "failure") {
      throw new Error("Synthetic core failure");
    }
    if (coreOutcome !== "success") {
      throw new Error(`Unsupported core test outcome: ${coreOutcome}`);
    }

    return {
      ok: true,
      chatId,
      messageId: 42,
    };
  },
}));

await import("../src/index.ts");
