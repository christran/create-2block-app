import "server-only";

import { Resend } from 'resend';
import EmailVerificationTemplate from "./templates/email-verification";
import ResetPasswordTemplate from "./templates/reset-password";
import { env } from "@/env";
import { EMAIL_SENDER } from "@/lib/constants";
import type { ComponentProps } from "react";
import { logger } from "../logger";

const resend = new Resend(env.RESEND_API_KEY);

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
        react: <EmailVerificationTemplate {...(props as PropsMap[EmailTemplate.EmailVerification])} />,
      };
    case EmailTemplate.PasswordReset:
      return {
        subject: "Password reset",
        react: <ResetPasswordTemplate {...(props as PropsMap[EmailTemplate.PasswordReset])} />,
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

  const { subject, react } = await getEmailTemplate(template, props);

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_SENDER,
      to,
      subject,
      react,
    });

    if (error) {
      console.error('Error sending email: ', error);
      throw error;
    }

    logger.info(`📨 Email sent successfully to: ${to}`);

    return data;
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);

    throw error;
  }
};