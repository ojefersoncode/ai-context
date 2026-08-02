const PREFIX = "ai-context";

export const logger = {
  info(message: string): void {
    console.log(`[${PREFIX}] ${message}`);
  },
  success(message: string): void {
    console.log(`[${PREFIX}] ✔ ${message}`);
  },
  warn(message: string): void {
    console.warn(`[${PREFIX}] ⚠ ${message}`);
  },
  error(message: string): void {
    console.error(`[${PREFIX}] ✖ ${message}`);
  },
};
