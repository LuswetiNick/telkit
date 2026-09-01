import {
  type TelegramMessageOptions,
  telegramMessageOptionsSchema,
  type TelegramMessageOutput,
  telegramMessageOutputSchema,
  telegramSendMessageRequestSchema,
  type TelegramSendMessageResponse,
  telegramSendMessageResponseSchema,
} from "./schemas/schemas";

export async function sendTelegramMessage(
  input: TelegramMessageOptions,
): Promise<TelegramMessageOutput> {
  const parsedInput = telegramMessageOptionsSchema.parse(input);
  const requestBody = telegramSendMessageRequestSchema.parse({
    chat_id: parsedInput.chatId,
    text: parsedInput.message,
  });

  const url = `https://api.telegram.org/bot${parsedInput.botToken}/sendMessage`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: await Response.json(requestBody).text(),
    });
  } catch {
    throw new Error("Telegram request failed");
  }

  let data: TelegramSendMessageResponse;
  try {
    data = telegramSendMessageResponseSchema.parse(await response.json());
  } catch {
    throw new Error("Invalid Telegram response");
  }

  if (!response.ok || !data.ok || !data.result) {
    throw new Error(data.description ?? "Telegram message request failed");
  }

  return telegramMessageOutputSchema.parse({
    ok: true,
    chatId: parsedInput.chatId,
    messageId: data.result.message_id,
  });
}
