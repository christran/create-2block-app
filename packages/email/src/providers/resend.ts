import { sendEmail as sendEmailResendOriginal } from "../resend";
import type { EmailTemplate, PropsMap } from "../email-templates";

export const sendEmailResend = async <T extends EmailTemplate>(
  to: string,
  template: T,
  props: PropsMap[NoInfer<T>]
) => {
  try {
    const resend = await sendEmailResendOriginal(to, template, props);
    console.log(`📨 Email sent successfully to: ${to}`);
    return resend;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`Resend error: ${errorMessage}`);
    throw new Error(`Resend error: ${errorMessage}`);
  }
};
