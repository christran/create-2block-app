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
    REDIS_URL: z.string().trim().min(1),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    INTERNAL_API_KEY: z.string().trim().min(1),
    MAGIC_LINK_AUTH: z.boolean().default(false),
    UMAMI_WEBSITE_ID: z.string().trim().min(1),
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

    // Cloudflare R2 and Backblaze B2
    S3_PROVIDER: z.enum(["cloudflare", "backblaze"]).default("cloudflare"),
    BUCKET_NAME: z.string().trim().min(1),

    // Cloudflare R2
    CLOUDFLARE_ACCOUNT_ID: z.string().trim().min(1),
    CLOUDFLARE_ZONE_ID: z.string().trim().min(1),
    CLOUDFLARE_AUTH_KEY: z.string().trim().min(1),
    CLOUDFLARE_AUTH_EMAIL: z.string().trim().min(1),
    R2_ENDPOINT: z.string().trim().min(1),
    R2_ACCESS_KEY_ID: z.string().trim().min(1),
    R2_SECRET_ACCESS_KEY: z.string().trim().min(1),

    // Backblaze B2
    B2_ENDPOINT: z.string().trim().min(1),
    B2_ACCESS_KEY_ID: z.string().trim().min(1),
    B2_SECRET_ACCESS_KEY: z.string().trim().min(1),

    // Stripe
    STRIPE_API_KEY: z.string().trim().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().trim().min(1),
    STRIPE_PRO_MONTHLY_PLAN_ID: z.string().trim().min(1),
    STRIPE_PRO_PLUS_MONTHLY_PLAN_ID: z.string().trim().min(1),
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
    REDIS_URL: process.env.REDIS_URL,
    NODE_ENV: process.env.NODE_ENV,
    INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
    MAGIC_LINK_AUTH: process.env.MAGIC_LINK_AUTH === "true" || process.env.MAGIC_LINK_AUTH === "1",
    UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID,
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

    // Cloudflare R2 and Backblaze B2
    S3_PROVIDER: process.env.S3_PROVIDER,
    BUCKET_NAME: process.env.BUCKET_NAME,

    // Cloudflare R2
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
    CLOUDFLARE_AUTH_KEY: process.env.CLOUDFLARE_AUTH_KEY,
    CLOUDFLARE_AUTH_EMAIL: process.env.CLOUDFLARE_AUTH_EMAIL,
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,

    // Backblaze B2
    B2_ENDPOINT: process.env.B2_ENDPOINT,
    B2_ACCESS_KEY_ID: process.env.B2_ACCESS_KEY_ID,
    B2_SECRET_ACCESS_KEY: process.env.B2_SECRET_ACCESS_KEY,

    // Stripe
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRO_MONTHLY_PLAN_ID: process.env.STRIPE_PRO_MONTHLY_PLAN_ID,
    STRIPE_PRO_PLUS_MONTHLY_PLAN_ID: process.env.STRIPE_PRO_PLUS_MONTHLY_PLAN_ID,
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
