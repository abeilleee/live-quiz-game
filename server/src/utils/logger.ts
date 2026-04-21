import chalk from 'chalk';

export class Logger {
  private static plainColor = '#ffffff';
  private static errorColor = '#f40136';
  private static successColor = '#0bf7f7';
  private static userColor = '#21de86';
  private static warningColor = '#f8df1d';

  static plain(text: string) {
    console.log(chalk.hex(this.plainColor)(text));
  }

  static error(text: string) {
    console.log(chalk.hex(this.errorColor).bold(text));
  }

  static success(text: string) {
    console.log(chalk.hex(this.successColor).bold(text));
  }

  static user(text: string) {
    console.log(chalk.hex(this.userColor).bold(text));
  }

  static warning(text: string) {
    console.log(chalk.hex(this.warningColor).bold(text));
  }
}
