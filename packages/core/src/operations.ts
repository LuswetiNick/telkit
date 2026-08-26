import {
  type TelegramMessageOptions,
  telegramMessageOptionsSchema,
  type TelegramMessageOutput,
  telegramMessageOutputSchema,
  telegramSendMessageRequestSchema,
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
  const respone = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: await Response.json(requestBody).text(),
  });

  const data = telegramSendMessageResponseSchema.parse(await respone.json());

  if (!respone.ok || !data.result || !data.result) {
    throw new Error(data.description ?? "Telegram message request failed");
  }

  return telegramMessageOutputSchema.parse({
    ok: true,
    chatId: parsedInput.chatId,
    messageId: data.result.message_id,
  });
}
