import { mock } from "bun:test";

const coreOutcome = process.env.TELKIT_TEST_CORE_OUTCOME;

mock.module("telkit-core", () => ({
  sendTelegramMessage: async ({ chatId, message, botToken }) => {
    if (
      chatId !== "fake-chat-id" ||
      message !== "Fake message" ||
      botToken !== "test-bot-token"
    ) {
      throw new Error("CLI passed unexpected input to telkit-core");
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
