import "server-only";

import React from "react";

import { Resend } from 'resend';
import MagicLinkTemplate from "./templates/magic-link";
import EmailVerificationTemplate from "./templates/email-verification";
import ResetPasswordTemplate from "./templates/reset-password";
import WelcomeTemplate from "./templates/welcome";
import AccountDeletedTemplate from "./templates/account-deleted";
import { EMAIL_SENDER } from "@2block/shared/shared-constants";

import { EmailTemplate } from "./email-service";
import type { PropsMap } from "./email-service";
import { env } from "../env";

const resend = new Resend(env.RESEND_API_KEY);

const getEmailTemplate = <T extends EmailTemplate>(template: T, props: PropsMap[NoInfer<T>]) => {
  switch (template) {
    case EmailTemplate.MagicLink:
      return {
        subject: "Your Magic Link",
        react: <MagicLinkTemplate {...(props as PropsMap[EmailTemplate.MagicLink])} />
      };
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
    console.log("📨 Email sent to: ", to, "with template: ", template, "and props: ", props);
    return;
  }

  const { subject, react } = getEmailTemplate(template, props);

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_SENDER,
      to,
      subject,
      react,
    });

    if (error) {
      console.error('Error sending email: ', error);
      throw new Error(error.message);
    }

    console.log(`📨 Email sent successfully to: ${to}`);

    return data;
  } catch (error) {
    console.log(`Failed to send email to: ${to} `, error);

    throw error;
  }
};