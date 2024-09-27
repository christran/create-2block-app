import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  server: {
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
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().trim().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    EMAIL_SERVER: process.env.EMAIL_SERVER,
    PLUNK_API_KEY: process.env.PLUNK_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    MOCK_SEND_EMAIL: process.env.MOCK_SEND_EMAIL,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
