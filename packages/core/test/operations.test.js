import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { sendTelegramMessage } from "../src/index";

const botToken = "test-bot-token";
const chatId = "123456789";
const message = "Test message";
const messageId = 987654321;
const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

function mockTelegramResponse(body, init) {
  return spyOn(globalThis, "fetch").mockResolvedValue(
    Response.json(body, init),
  );
}

function mockSuccessfulTelegramResponse() {
  return mockTelegramResponse({
    ok: true,
    result: {
      message_id: messageId,
    },
  });
}

async function captureRejection(promise) {
  return promise.then(
    () => {
      throw new Error("Expected operation to reject");
    },
    (error) => error,
  );
}

function expectSafeError(error) {
  expect(error).toBeInstanceOf(Error);
  expect(error.message).not.toContain(botToken);
  expect(error.message).not.toContain(telegramUrl);
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
    expect(fetchMock).toHaveBeenCalledWith(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });
  });

  test("rejects a Telegram-shaped HTTP error response", async () => {
    mockTelegramResponse(
      {
        ok: false,
        description: "Internal Server Error",
      },
      { status: 500 },
    );

    await expect(
      sendTelegramMessage({ chatId, message, botToken }),
    ).rejects.toThrow("Internal Server Error");
  });

  test("rejects a Telegram API failure returned with HTTP 200", async () => {
    mockTelegramResponse({
      ok: false,
      description: "Bad Request: chat not found",
    });

    await expect(
      sendTelegramMessage({ chatId, message, botToken }),
    ).rejects.toThrow("Bad Request: chat not found");
  });

  test("requires Telegram ok even when a result is present", async () => {
    mockTelegramResponse({
      ok: false,
      description: "Bad Request: operation failed",
      result: {
        message_id: messageId,
      },
    });

    await expect(
      sendTelegramMessage({ chatId, message, botToken }),
    ).rejects.toThrow("Bad Request: operation failed");
  });

  test("rejects a successful response without a result", async () => {
    mockTelegramResponse({ ok: true });

    await expect(
      sendTelegramMessage({ chatId, message, botToken }),
    ).rejects.toThrow("Telegram message request failed");
  });

  test("normalizes network errors without exposing the request URL", async () => {
    spyOn(globalThis, "fetch").mockRejectedValue(
      new Error(`Network unavailable for ${telegramUrl}`),
    );

    const error = await captureRejection(
      sendTelegramMessage({ chatId, message, botToken }),
    );

    expectSafeError(error);
    expect(error.message).toContain("Telegram request");
  });

  test("normalizes a response that cannot be parsed as JSON", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Bad Gateway", {
        status: 502,
        headers: {
          "Content-Type": "text/html",
        },
      }),
    );

    const error = await captureRejection(
      sendTelegramMessage({ chatId, message, botToken }),
    );

    expectSafeError(error);
    expect(error.message).toContain("Telegram response");
  });

  test("normalizes structurally invalid Telegram JSON", async () => {
    mockTelegramResponse({ unexpected: true });

    const error = await captureRejection(
      sendTelegramMessage({ chatId, message, botToken }),
    );

    expectSafeError(error);
    expect(error.message).toContain("Telegram response");
  });
});
