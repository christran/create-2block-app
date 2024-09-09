import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (str) => !str.includes("YOUR_DATABASE_URL_HERE"),
        "You forgot to change the default URL",
      ),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    INTERNAL_API_KEY: z.string().trim().min(1),
    TRIGGER_SECRET_KEY: z.string().trim().min(1),
    EMAIL_SERVER: z.enum(["plunk", "ses", "smtp", "resend"]).default("resend"),
    PLUNK_API_KEY: z.string().trim().min(1),
    RESEND_API_KEY: z.string().trim().min(1),
    AWS_ACCESS_KEY_ID: z.string().trim().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().trim().min(1),
    SMTP_HOST: z.string().trim().min(1),
    SMTP_PORT: z.number().int().min(1),
    SMTP_USER: z.string().trim().min(1),
    SMTP_PASSWORD: z.string().trim().min(1),
    MOCK_SEND_EMAIL: z.boolean().default(false),
    GOOGLE_CLIENT_ID: z.string().trim().min(1),
    GOOGLE_CLIENT_SECRET: z.string().trim().min(1),
    DISCORD_CLIENT_ID: z.string().trim().min(1),
    DISCORD_CLIENT_SECRET: z.string().trim().min(1),
    GITHUB_CLIENT_ID: z.string().trim().min(1),
    GITHUB_CLIENT_SECRET: z.string().trim().min(1),
    GITHUB_LOCALHOST_CLIENT_ID: z.string().trim().min(1),
    GITHUB_LOCALHOST_CLIENT_SECRET: z.string().trim().min(1),
    STRIPE_API_KEY: z.string().trim().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().trim().min(1),
    STRIPE_PRO_MONTHLY_PLAN_ID: z.string().trim().min(1),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // Server-side env vars
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
    TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,
    EMAIL_SERVER: process.env.EMAIL_SERVER,
    PLUNK_API_KEY: process.env.PLUNK_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: parseInt(process.env.SMTP_PORT ?? ""),
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    MOCK_SEND_EMAIL: process.env.MOCK_SEND_EMAIL === "true" || process.env.MOCK_SEND_EMAIL === "1",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_LOCALHOST_CLIENT_ID: process.env.GITHUB_LOCALHOST_CLIENT_ID,
    GITHUB_LOCALHOST_CLIENT_SECRET: process.env.GITHUB_LOCALHOST_CLIENT_SECRET,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRO_MONTHLY_PLAN_ID: process.env.STRIPE_PRO_MONTHLY_PLAN_ID,
    // Client-side env vars
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
