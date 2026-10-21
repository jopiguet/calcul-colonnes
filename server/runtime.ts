/**
 * Where the server runs, and how it logs.
 *
 * Cloud Run sets K_SERVICE in a service and CLOUD_RUN_JOB in a job; nothing
 * else needs configuring to know we are there. On Cloud Run (or with
 * LOG_FORMAT=json) each log line is one JSON object with `severity` and
 * `message`, which Cloud Logging reads as a structured entry; elsewhere logs
 * stay plain lines for a terminal.
 */

export const onCloudRun = Boolean(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB);

const json = process.env.LOG_FORMAT === "json" || (process.env.LOG_FORMAT !== "text" && onCloudRun);

type Severity = "INFO" | "WARNING" | "ERROR";

function write(severity: Severity, message: string, fields: Record<string, unknown> = {}): void {
  if (json) {
    const line = JSON.stringify({ severity, message, ...fields });
    (severity === "INFO" ? process.stdout : process.stderr).write(line + "\n");
    return;
  }
  const extra = Object.keys(fields).length > 0 ? ` ${JSON.stringify(fields)}` : "";
  (severity === "INFO" ? console.log : console.error)(message + extra);
}

export const log = {
  info: (message: string, fields?: Record<string, unknown>): void => write("INFO", message, fields),
  warn: (message: string, fields?: Record<string, unknown>): void => write("WARNING", message, fields),
  error: (message: string, error?: unknown, fields?: Record<string, unknown>): void =>
    write("ERROR", message, {
      ...fields,
      ...(error instanceof Error ? { error: error.message, stack: error.stack } : error === undefined ? {} : { error: String(error) }),
    }),
};
