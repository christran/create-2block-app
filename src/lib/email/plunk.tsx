import "server-only";

import React from "react";

import EmailVerificationTemplate from "@/lib/email/templates/email-verification";
import ResetPasswordTemplate from "@/lib/email/templates/reset-password";
import WelcomeTemplate from "@/lib/email/templates/welcome";
import AccountDeletedTemplate from "@/lib/email/templates/account-deleted";
import { createTransport, TransportOptions } from "nodemailer";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { sendEmail as sendEmailResend } from "@/lib/email/resend";
import { EMAIL_SENDER_NAME, EMAIL_SENDER_ADDRESS, EMAIL_SENDER } from "@/lib/constants";
import type { ComponentProps } from "react";
import { render } from '@react-email/render';
import { env } from "@/env";
import { logger } from "../logger";
import MagicLinkTemplate from "./templates/magic-link";

interface PlunkApiResponse {
  success: boolean;
  emails?: Array<{ contact: { id: string, email: string } }>;
  timestamp?: string;
  error?: string;
  message?: string;
  time?: string;
}

export enum EmailTemplate {
  MagicLink = "MagicLink",
  EmailVerification = "EmailVerification",
  PasswordReset = "PasswordReset",
  Welcome = "Welcome",
  AccountDeleted = "AccountDeleted",
}

export type PropsMap = {
  [EmailTemplate.MagicLink]: ComponentProps<typeof MagicLinkTemplate>;
  [EmailTemplate.EmailVerification]: ComponentProps<typeof EmailVerificationTemplate>;
  [EmailTemplate.PasswordReset]: ComponentProps<typeof ResetPasswordTemplate>;
  [EmailTemplate.Welcome]: ComponentProps<typeof WelcomeTemplate>;
  [EmailTemplate.AccountDeleted]: ComponentProps<typeof AccountDeletedTemplate>;
};

const getEmailTemplate = async <T extends EmailTemplate>(template: T, props: PropsMap[NoInfer<T>]) => {
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

export const sendEmail = async <T extends EmailTemplate>(
  to: string,
  template: T,
  props: PropsMap[NoInfer<T>],
) => {
  if (env.MOCK_SEND_EMAIL) {
    logger.info("📨 Email sent to: ", to, "with template: ", template, "and props: ", props);
    return;
  }

  const emailServer = env.NODE_ENV === "production" ? "resend" : env.EMAIL_SERVER;

  switch (emailServer) {
    case "plunk":
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
    case "smtp":
      const smtpConfig = {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      };
      
      const transporter = createTransport(smtpConfig as TransportOptions);
      
      try {
        const { subject, body } = await getEmailTemplate(template, props);
    
        const result = await transporter.sendMail({ 
          from: EMAIL_SENDER, 
          to, 
          subject, 
          html: body 
        });
        logger.info(`📨 Email sent successfully to: ${to}`);
    
        return result;
      } catch (error) {
        logger.error(`Failed to send email to: ${to} `, error);
        
        throw error; // Re-throw the error for the caller to handle if needed
      }
    case "ses":
      const sesClient = new SESv2Client({ 
        region: 'us-west-1',
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY
        },
      });
  
      try {    
        const { subject, body } = await getEmailTemplate(template, props);
    
        const params = {
          FromEmailAddress: EMAIL_SENDER,
          Destination: {
            ToAddresses: [to],
          },
          Content: {
            Simple: {
              Subject: {
                Charset: "UTF-8",
                Data: subject,
              },
              Body: {
                Html: {
                  Charset: "UTF-8",
                  Data: body,
                },
              },
            }
          }
        };
    
        const command = new SendEmailCommand(params);
    
        const result = await sesClient.send(command);
        
        logger.info(`📨 Email sent successfully to: ${to}`);
        
        return result;
      } catch (error) {
        logger.error(`Failed to send email to: ${to} `, error);
    
        throw error;
      }
    case "resend":
      try {
        const resend = await sendEmailResend(
            to,
            template,
            props
          )

        return resend;
      } catch (error) {
        console.log(error);
        throw new Error(`Resend error:  ${error}`);
      }
    default:
      throw new Error(`Invalid email server: ${emailServer}`);
  }
};