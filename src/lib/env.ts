import Constants from "expo-constants";
import { z } from "zod";

/**
 * Validated build-time environment. Import `env` instead of reading `process.env` so a missing
 * or malformed variable fails at startup with a clear message, not later as a confusing request
 * error.
 *
 * `EXPO_PUBLIC_*` variables must be referenced as literal `process.env.EXPO_PUBLIC_X` for
 * Metro to inline them, so they are listed explicitly below instead of iterating `process.env`.
 */
const schema = z.object({
  EXPO_PUBLIC_API_URL: z.url({
    error: "EXPO_PUBLIC_API_URL must be a full URL such as https://api.example.com.",
  }),
});

const parsed = schema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
});

if (!parsed.success) {
  const problems = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(
    `Invalid environment:\n${problems}\nCopy .env.example to .env.local and restart Expo.`
  );
}

export type AppEnv = "development" | "staging" | "production";

const APP_ENVS: readonly AppEnv[] = ["development", "staging", "production"];
const extraEnv = Constants.expoConfig?.extra?.appEnv;

export const env = {
  /** Which build profile this is, set by `APP_ENV` in `eas.json` (see `app.config.ts`). */
  appEnv: APP_ENVS.find((value) => value === extraEnv) ?? "production",
  /** Base URL of the API, without a trailing slash. */
  apiUrl: parsed.data.EXPO_PUBLIC_API_URL.replace(/\/+$/, ""),
} as const;
