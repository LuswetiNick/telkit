import { Command } from "commander";
import { sendTelegramMessage } from "telkit-core";

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

    try {
      const result = await sendTelegramMessage({
        chatId,
        message,
        botToken: token,
      });
      console.log(`Message sent successfully. Message ID: ${result.messageId}`);
      console.log(`Chat ID: ${result.chatId}`);
    } catch (error) {
      const detailError =
        error instanceof Error ? error.message : String(error);
      console.error(`Telegram API request failed: ${detailError}`);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
