import chalk from 'chalk';

export class Logger {
  private static plainColor = '#ffffff';
  private static errorColor = '#f40136';
  private static successColor = '#0bf7f7';

  static plain(text: string) {
    console.log(chalk.hex(this.plainColor)(text));
  }

  static error(text: string) {
    console.log(chalk.hex(this.errorColor).bold(text));
  }

  static success(text: string) {
    console.log(chalk.hex(this.successColor).bold(text));
  }
}
