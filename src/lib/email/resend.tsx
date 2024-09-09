import "server-only";

import React from "react";

import { Resend } from 'resend';
import EmailVerificationTemplate from "@/lib/email/templates/email-verification";
import ResetPasswordTemplate from "@/lib/email/templates/reset-password";
import WelcomeTemplate from "@/lib/email/templates/welcome";
import AccountDeletedTemplate from "@/lib/email/templates/account-deleted";
import { env } from "@/env";
import { EMAIL_SENDER } from "@/lib/constants";
import type { ComponentProps } from "react";
import { logger } from "../logger";

const resend = new Resend(env.RESEND_API_KEY);

export enum EmailTemplate {
  EmailVerification = "EmailVerification",
  PasswordReset = "PasswordReset",
  Welcome = "Welcome",
  AccountDeleted = "AccountDeleted",
}

export type PropsMap = {
  [EmailTemplate.EmailVerification]: ComponentProps<typeof EmailVerificationTemplate>;
  [EmailTemplate.PasswordReset]: ComponentProps<typeof ResetPasswordTemplate>;
  [EmailTemplate.Welcome]: ComponentProps<typeof WelcomeTemplate>;
  [EmailTemplate.AccountDeleted]: ComponentProps<typeof AccountDeletedTemplate>;
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
    case EmailTemplate.Welcome:
      return {
        subject: "Welcome to 2BLOCK",
        react: <WelcomeTemplate {...(props as PropsMap[EmailTemplate.Welcome])} />,
      };
    case EmailTemplate.AccountDeleted:
      return {
        subject: "Why are you running?",
        react: <AccountDeletedTemplate {...(props as PropsMap[EmailTemplate.AccountDeleted])} />,
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
    logger.error(`Failed to send email to: ${to} `, error);

    throw error;
  }
};