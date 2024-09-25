import { sendEmail as sendEmailResendOriginal } from "@/lib/email/resend";
import { EmailTemplate, PropsMap } from "../email-templates";
import { logger } from "../../logger";

export const sendEmailResend = async <T extends EmailTemplate>(
  to: string,
  template: T,
  props: PropsMap[NoInfer<T>]
) => {
  try {
    const resend = await sendEmailResendOriginal(to, template, props);
    logger.info(`📨 Email sent successfully to: ${to}`);
    return resend;
  } catch (error) {
    logger.error(`Resend error: ${error}`);
    throw new Error(`Resend error: ${error}`);
  }
};
