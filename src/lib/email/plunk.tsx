import "server-only";

import EmailVerificationTemplate from "./templates/email-verification";
import ResetPasswordTemplate from "./templates/reset-password";
import { env } from "@/env";
import { EMAIL_SENDER_NAME, EMAIL_SENDER_ADDRESS } from "@/lib/constants";
import type { ComponentProps } from "react";
import { render } from '@react-email/render';
import { logger } from "../logger";

// Add this interface near the top of the file, after imports
interface PlunkApiResponse {
  success: boolean;
  emails?: Array<{ contact: { id: string, email: string } }>;
  timestamp?: string;
  error?: string;
  message?: string;
  time?: string;
}

export enum EmailTemplate {
  EmailVerification = "EmailVerification",
  PasswordReset = "PasswordReset",
}

export type PropsMap = {
  [EmailTemplate.EmailVerification]: ComponentProps<typeof EmailVerificationTemplate>;
  [EmailTemplate.PasswordReset]: ComponentProps<typeof ResetPasswordTemplate>;
};

const getEmailTemplate = async <T extends EmailTemplate>(template: T, props: PropsMap[NoInfer<T>]) => {
  switch (template) {
    case EmailTemplate.EmailVerification:
      return {
        subject: "Verify your account",
        body: await render(
        <EmailVerificationTemplate {...(props as PropsMap[EmailTemplate.EmailVerification])} />
      ),
      };
    case EmailTemplate.PasswordReset:
      return {
        subject: "Password reset",
        body: await render(
        <ResetPasswordTemplate {...(props as PropsMap[EmailTemplate.PasswordReset])} />
      ),
      };
    default:
      throw new Error("Invalid email template");
  }
};

export const sendEmail = async <T extends EmailTemplate>(
  to: string,
  template: T,
  props: PropsMap[NoInfer<T>],
) => {
  if (env.MOCK_SEND_EMAIL) {
    logger.info("📨 Email sent to:", to, "with template:", template, "and props:", props);
    return;
  }

  const { subject, body } = await getEmailTemplate(template, props);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.PLUNK_API_KEY}`
    },
    body: JSON.stringify({
      name: EMAIL_SENDER_NAME,
      from: EMAIL_SENDER_ADDRESS,
      to,
      subject,
      body,
      subscribed: true,
    })
  };

  try {
    const response = await fetch('https://resend.2block.co/api/v1/send', options);
    const data = await response.json() as PlunkApiResponse;

    if (!response.ok) {
      throw new Error(`Error: ${response.status}\n${(data.error, data.message)}`);
    }

    if (!data.success) {
      throw new Error((data.error, data.message) ?? 'Failed to send email');
    }

    // save contactId to database

    logger.info(`📨 Email sent successfully to: ${to}`, {
      contactId: data.emails?.[0]?.contact.id,
      email: data.emails?.[0]?.contact.email,
      timestamp: data.timestamp,
    });

    return data;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: `, error instanceof Error ? error.message : String(error));
    throw error;
  }
};