export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private level: LogLevel;
  private prefix = "[GrowBolt]";

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }

  debug(msg: string, ...args: any[]) {
    if (this.level <= LogLevel.DEBUG) {
      console.log(`${this.prefix} [DEBUG] ${msg}`, ...args);
    }
  }

  info(msg: string, ...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.log(`${this.prefix} [INFO] ${msg}`, ...args);
    }
  }

  warn(msg: string, ...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`${this.prefix} [WARN] ${msg}`, ...args);
    }
  }

  error(msg: string, ...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error(`${this.prefix} [ERROR] ${msg}`, ...args);
    }
  }
}

export const logger = new Logger();
export default logger;
