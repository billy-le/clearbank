import fs from "node:fs";
import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize, errors, json } = format;

const logDir = "logs";

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const appFileRotateTransport = new transports.DailyRotateFile({
  filename: "%DATE%-app.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "30d",
  dirname: logDir,
  zippedArchive: true,
});

const errorFileRotateTransport = new transports.DailyRotateFile({
  level: "error",
  filename: "%DATE%-error.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "30d",
  dirname: logDir,
  zippedArchive: true,
});

export const logger = createLogger({
  level: "info",
  transports: [appFileRotateTransport, errorFileRotateTransport],
});

if (Bun.env.NODE_ENV === "production") {
  logger.add(new transports.Console());
} else if (Bun.env.NODE_ENV === "development") {
  logger.add(
    new transports.Console({
      format: combine(
        errors({ stack: true }),
        colorize(),
        timestamp(),
        printf(
          ({ level, message, timestamp, stack }) =>
            `[${timestamp}]:${level}: ${message}${stack ? `\n\n${stack}` : ""}`
        )
      ),
    })
  );
}
