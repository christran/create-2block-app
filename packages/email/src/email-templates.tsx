import React from "react";
import { render } from '@react-email/render';
import type { ComponentProps } from "react";
import MagicLinkTemplate from "./templates/magic-link";
import EmailVerificationTemplate from "./templates/email-verification";
import ResetPasswordTemplate from "./templates/reset-password";
import WelcomeTemplate from "./templates/welcome";
import AccountDeletedTemplate from "./templates/account-deleted";

export enum EmailTemplate {
  MagicLink = "MagicLink",
  EmailVerification = "EmailVerification",
  PasswordReset = "PasswordReset",
  Welcome = "Welcome",
  AccountDeleted = "AccountDeleted",
}

export interface PropsMap {
  [EmailTemplate.MagicLink]: ComponentProps<typeof MagicLinkTemplate>;
  [EmailTemplate.EmailVerification]: ComponentProps<typeof EmailVerificationTemplate>;
  [EmailTemplate.PasswordReset]: ComponentProps<typeof ResetPasswordTemplate>;
  [EmailTemplate.Welcome]: ComponentProps<typeof WelcomeTemplate>;
  [EmailTemplate.AccountDeleted]: ComponentProps<typeof AccountDeletedTemplate>;
}

export const getEmailTemplate = async <T extends EmailTemplate>(template: T, props: PropsMap[NoInfer<T>]) => {
  switch (template) {
    case EmailTemplate.MagicLink:
      return {
        subject: "Your Magic Link",
        body: await render(
        <MagicLinkTemplate {...(props as PropsMap[EmailTemplate.MagicLink])} />
        ),
      };
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
    case EmailTemplate.Welcome:
      return {
        subject: "Welcome to 2BLOCK",
        body: await render(
        <WelcomeTemplate {...(props as PropsMap[EmailTemplate.Welcome])} />
        ),
      };
    case EmailTemplate.AccountDeleted:
      return {
        subject: "Why are you running?",
        body: await render(
        <AccountDeletedTemplate {...(props as PropsMap[EmailTemplate.AccountDeleted])} />
        ),
      };
    default:
      throw new Error("Invalid email template");
  }
};
