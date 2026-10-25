import { readFileSync } from "node:fs";

/** The app's version (package.json, next to the server in every layout), recorded with feedback. */
export const APP_VERSION: string = (() => {
  try {
    return (JSON.parse(readFileSync("package.json", "utf8")) as { version?: string }).version ?? "";
  } catch {
    return "";
  }
})();
