import "server-only";
import { env } from "@/env";
import { logger } from "../logger";
import { EmailTemplate, PropsMap } from "./email-templates";
import { getEmailTemplate } from "./email-templates";
import { sendEmailPlunk } from "./providers/plunk";
import { sendEmailSMTP } from "./providers/smtp";
import { sendEmailSES } from "./providers/ses";
import { sendEmailResend } from "./providers/resend";

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
  const { subject, body } = await getEmailTemplate(template, props);

  try {
    switch (emailServer) {
      case "plunk":
        return await sendEmailPlunk(to, subject, body);
      case "smtp":
        return await sendEmailSMTP(to, subject, body);
      case "ses":
        return await sendEmailSES(to, subject, body);
      case "resend":
        return await sendEmailResend(to, template, props);
      default:
        throw new Error(`Invalid email server: ${emailServer}`);
    }
  } catch (error) {
    logger.error(`Failed to send email to ${to}: `, error instanceof Error ? error.message : String(error));
    throw error;
  }
};

export { EmailTemplate, type PropsMap };
