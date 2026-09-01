import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { sendTelegramMessage } from "../src/index";

const botToken = "test-bot-token";
const chatId = "123456789";
const message = "Test message";
const messageId = 987654321;

function mockSuccessfulTelegramResponse() {
  return spyOn(globalThis, "fetch").mockResolvedValue(
    Response.json({
      ok: true,
      result: {
        message_id: messageId,
      },
    }),
  );
}

afterEach(() => {
  mock.restore();
});

describe("sendTelegramMessage", () => {
  test("returns the normalized Telkit result for a successful response", async () => {
    mockSuccessfulTelegramResponse();

    const result = await sendTelegramMessage({ chatId, message, botToken });

    expect(result).toEqual({
      ok: true,
      chatId,
      messageId,
    });
  });

  test("sends the expected Telegram HTTP request", async () => {
    const fetchMock = mockSuccessfulTelegramResponse();

    await sendTelegramMessage({ chatId, message, botToken });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      },
    );
  });
});
