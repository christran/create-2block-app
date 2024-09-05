import "server-only";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { EmailVerificationTemplate } from "./templates/email-verification";
import { ResetPasswordTemplate } from "./templates/reset-password";
import { render } from "@react-email/render";
import { env } from "@/env";
import { EMAIL_SENDER } from "@/lib/constants";
import type { ComponentProps } from "react";
import { logger } from "../logger";

export enum EmailTemplate {
  EmailVerification = "EmailVerification",
  PasswordReset = "PasswordReset",
}

export type PropsMap = {
  [EmailTemplate.EmailVerification]: ComponentProps<typeof EmailVerificationTemplate>;
  [EmailTemplate.PasswordReset]: ComponentProps<typeof ResetPasswordTemplate>;
};

const sesClient = new SESClient({ 
  region: 'us-west-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const getEmailTemplate = async <T extends EmailTemplate>(template: T, props: PropsMap[NoInfer<T>]) => {
  switch (template) {
    case EmailTemplate.EmailVerification:
      return {
        subject: "Verify your account",
        body: await render(
          <EmailVerificationTemplate {...(props as PropsMap[EmailTemplate.EmailVerification])} />,
        ),
      };
    case EmailTemplate.PasswordReset:
      return {
        subject: "Password reset",
        body: await render(
          <ResetPasswordTemplate {...(props as PropsMap[EmailTemplate.PasswordReset])} />,
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
  try {
    if (env.MOCK_SEND_EMAIL) {
      logger.info("📨 Email sent to:", to, "with template:", template, "and props:", props);
      return;
    }

    const { subject, body } = await getEmailTemplate(template, props);

    const params = {
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: body,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: '2BLOCK <christophertran714@gmail.com>', // Change this to EMAIL_SENDER after SES prod approval
    };

    const command = new SendEmailCommand(params);

    const result = await sesClient.send(command);
    
    logger.info(`📨 Email sent successfully to: ${to}`);
    
    return result;
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);

    throw error;
  }
};