import { describe, expect, test } from "bun:test";
import {
  telegramMessageInputSchema,
  telegramMessageOptionsSchema,
  telegramMessageOutputSchema,
  telegramSendMessageRequestSchema,
  telegramSendMessageResponseSchema,
} from "telkit-core";

const chatId = "123456789";
const message = "Hello from Telkit";
const botToken = "test-bot-token";

describe("telegramMessageInputSchema", () => {
  test("accepts valid shared message input", () => {
    expect(
      telegramMessageInputSchema.safeParse({ chatId, message }).success,
    ).toBe(true);
  });

  test("rejects missing, empty, and wrongly typed input fields", () => {
    expect(telegramMessageInputSchema.safeParse({ message }).success).toBe(
      false,
    );
    expect(
      telegramMessageInputSchema.safeParse({ chatId: "", message }).success,
    ).toBe(false);
    expect(telegramMessageInputSchema.safeParse({ chatId }).success).toBe(
      false,
    );
    expect(
      telegramMessageInputSchema.safeParse({ chatId, message: "" }).success,
    ).toBe(false);
    expect(
      telegramMessageInputSchema.safeParse({ chatId: 123456789, message })
        .success,
    ).toBe(false);
    expect(
      telegramMessageInputSchema.safeParse({ chatId, message: 42 }).success,
    ).toBe(false);
  });
});

describe("telegramMessageOptionsSchema", () => {
  test("accepts valid message options with a fake bot token", () => {
    expect(
      telegramMessageOptionsSchema.safeParse({ chatId, message, botToken })
        .success,
    ).toBe(true);
  });

  test("rejects a missing or empty bot token", () => {
    expect(
      telegramMessageOptionsSchema.safeParse({ chatId, message }).success,
    ).toBe(false);
    expect(
      telegramMessageOptionsSchema.safeParse({
        chatId,
        message,
        botToken: "",
      }).success,
    ).toBe(false);
  });
});

describe("telegramSendMessageRequestSchema", () => {
  test("accepts the expected Telegram request shape", () => {
    expect(
      telegramSendMessageRequestSchema.safeParse({
        chat_id: chatId,
        text: "Hello",
      }).success,
    ).toBe(true);
  });

  test("rejects missing or empty Telegram request fields", () => {
    expect(
      telegramSendMessageRequestSchema.safeParse({ text: "Hello" }).success,
    ).toBe(false);
    expect(
      telegramSendMessageRequestSchema.safeParse({
        chat_id: "",
        text: "Hello",
      }).success,
    ).toBe(false);
    expect(
      telegramSendMessageRequestSchema.safeParse({ chat_id: chatId }).success,
    ).toBe(false);
    expect(
      telegramSendMessageRequestSchema.safeParse({
        chat_id: chatId,
        text: "",
      }).success,
    ).toBe(false);
  });
});

describe("telegramSendMessageResponseSchema", () => {
  test("accepts expected Telegram success and error responses", () => {
    expect(
      telegramSendMessageResponseSchema.safeParse({
        ok: true,
        result: {
          message_id: 42,
        },
      }).success,
    ).toBe(true);
    expect(
      telegramSendMessageResponseSchema.safeParse({
        ok: false,
        description: "Bad Request: chat not found",
      }).success,
    ).toBe(true);
  });

  test("rejects invalid Telegram response field types", () => {
    expect(
      telegramSendMessageResponseSchema.safeParse({ ok: "true" }).success,
    ).toBe(false);
    expect(
      telegramSendMessageResponseSchema.safeParse({
        ok: true,
        result: {
          message_id: "42",
        },
      }).success,
    ).toBe(false);
  });
});

describe("telegramMessageOutputSchema", () => {
  test("accepts the normalized Telkit success result", () => {
    expect(
      telegramMessageOutputSchema.safeParse({
        ok: true,
        chatId,
        messageId: 42,
      }).success,
    ).toBe(true);
  });

  test("rejects invalid normalized result fields", () => {
    expect(
      telegramMessageOutputSchema.safeParse({
        ok: false,
        chatId,
        messageId: 42,
      }).success,
    ).toBe(false);
    expect(
      telegramMessageOutputSchema.safeParse({
        ok: true,
        messageId: 42,
      }).success,
    ).toBe(false);
    expect(
      telegramMessageOutputSchema.safeParse({
        ok: true,
        chatId,
        messageId: "42",
      }).success,
    ).toBe(false);
  });
});
