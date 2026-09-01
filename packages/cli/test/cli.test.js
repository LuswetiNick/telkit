import { describe, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";

const cliEntryPath = fileURLToPath(new URL("../src/index.ts", import.meta.url));
const testDirectory = fileURLToPath(new URL(".", import.meta.url));

async function runCli(args) {
  const child = Bun.spawn(
    [
      process.execPath,
      "run",
      "--no-env-file",
      "--no-install",
      cliEntryPath,
      ...args,
    ],
    {
      cwd: testDirectory,
      env: {
        NO_COLOR: "1",
      },
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
});
