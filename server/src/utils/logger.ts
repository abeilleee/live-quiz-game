const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

const colors = {
  plain: "\x1b[37m",
  error: "\x1b[31m",
  success: "\x1b[36m",
  user: "\x1b[32m",
  warning: "\x1b[33m",
};

export class Logger {
  private static print(color: string, text: string) {
    console.log(`${BOLD}${color}${text}${RESET}`);
  }

  static plain(text: string) {
    this.print(colors.plain, text);
  }

  static error(text: string) {
    this.print(colors.error, `❌ ${text}`);
  }

  static success(text: string) {
    this.print(colors.success, `✅ ${text}`);
  }

  static user(text: string) {
    this.print(colors.user, `👤 ${text}`);
  }

  static warning(text: string) {
    this.print(colors.warning, `⚠️ ${text}`);
  }
}
