type LogLevel = "debug" | "info" | "warn" | "error";

function emit(level: LogLevel, message: string, meta?: unknown) {
  if (process.env.NODE_ENV === "production" && level === "debug") return;

  const payload = meta === undefined ? "" : meta;
  if (level === "error") {
    console.error(`[bistro] ${message}`, payload);
  } else if (level === "warn") {
    console.warn(`[bistro] ${message}`, payload);
  } else {
    console.info(`[bistro] ${message}`, payload);
  }
}

export const logger = {
  debug: (message: string, meta?: unknown) => emit("debug", message, meta),
  info: (message: string, meta?: unknown) => emit("info", message, meta),
  warn: (message: string, meta?: unknown) => emit("warn", message, meta),
  error: (message: string, meta?: unknown) => emit("error", message, meta),
};
