import { describe, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";

const cliEntryPath = fileURLToPath(new URL("../src/index.ts", import.meta.url));
const mockCoreEntryPath = fileURLToPath(
  new URL("./mock-core-entry.js", import.meta.url),
);
const testDirectory = fileURLToPath(new URL(".", import.meta.url));

async function runCli(args, coreOutcome) {
  const entryPath = coreOutcome ? mockCoreEntryPath : cliEntryPath;
  const env = {
    NO_COLOR: "1",
  };

  if (coreOutcome) {
    env.TELEGRAM_BOT_TOKEN = "test-bot-token";
    env.TELKIT_TEST_CORE_OUTCOME = coreOutcome;
  }

  const child = Bun.spawn(
    [
      process.execPath,
      "run",
      "--no-env-file",
      "--no-install",
      entryPath,
      ...args,
    ],
    {
      cwd: testDirectory,
      env,
      stdout: "pipe",
      stderr: "pipe",
    },
  );

  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);

  return { exitCode, stdout, stderr };
}

describe("telkit CLI", () => {
  test("shows help for the CLI and telegram command", async () => {
    const result = await runCli(["--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: telkit");
    expect(result.stdout).toContain("telegram");
  });

  test("shows the currently declared CLI version", async () => {
    const result = await runCli(["--version"]);
    const version = result.stdout.trim();

    expect(result.exitCode).toBe(0);
    expect(version.length).toBeGreaterThan(0);
    expect(version).toBe("1.0.0");
  });

  test("rejects the telegram command when required arguments are missing", async () => {
    const result = await runCli(["telegram"]);

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("missing required argument");
    expect(result.stderr).toContain("chatId");
  });

  test("rejects the telegram command when the bot token is absent", async () => {
    const result = await runCli(["telegram", "fake-chat-id", "Fake message"]);

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("TELEGRAM_BOT_TOKEN is not set");
    expect(result.stdout).toBe("");
  });

  test("maps a successful core result to CLI output", async () => {
    const result = await runCli(
      ["telegram", "fake-chat-id", "Fake message"],
      "success",
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "Message sent successfully. Message ID: 42",
    );
    expect(result.stdout).toContain("Chat ID: fake-chat-id");
    expect(result.stderr).toBe("");
  });

  test("maps a core failure to safe CLI error output", async () => {
    const result = await runCli(
      ["telegram", "fake-chat-id", "Fake message"],
      "failure",
    );

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain(
      "Telegram API request failed: Synthetic core failure",
    );
    expect(result.stderr).not.toContain("test-bot-token");
    expect(result.stderr).not.toContain("api.telegram.org");
  });
});
