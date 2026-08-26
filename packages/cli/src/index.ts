import { Command } from "commander";

type TelegramResponse = {
  ok: boolean;
  result?: {
    message_id?: number;
  };
  description?: string;
};

const program = new Command();

program
  .name("telkit")
  .description("Telkit CLI tool")
  .version("1.0.0")
  .command("telegram")
  .description("Send a telegram message")
  .argument("<chatId>", "Telegram chat ID to send message to")
  .argument("<message>", "Text message to send")
  .action(async (chatId: string, message: string) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.error(
        "Error: TELEGRAM_BOT_TOKEN is not set in the environment variables.",
      );
      process.exit(1);
    }
    if (!chatId) {
      console.error("Error: chatId is required.");
      process.exit(1);
    }
    if (!message) {
      console.error("Error: message is required.");
      process.exit(1);
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const respone = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const data: TelegramResponse = await respone.json();

    if (!respone.ok || !data.ok) {
      const detail = data.description ?? respone.statusText;
      console.error(`Telegram API request failed: ${detail}`);
      process.exit(1);
    }

    const messageId = data.result?.message_id;
    console.log(`Telegram message sent successfully to chat ID ${chatId}.`);
    if (messageId !== undefined) {
      console.log(`Message sent successfully! Message ID: ${messageId}`);
    }
  });

program.parseAsync(process.argv);
