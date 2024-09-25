import { createTransport, type TransportOptions } from "nodemailer";
import { env } from "@/env";
import { logger } from "../../logger";
import { EMAIL_SENDER } from "@2block/shared/shared-constants";

export const sendEmailSMTP = async (to: string, subject: string, body: string) => {
  const smtpConfig = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  };
  
  const transporter = createTransport(smtpConfig as TransportOptions);
  
  const result = await transporter.sendMail({ 
    from: EMAIL_SENDER, 
    to, 
    subject, 
    html: body 
  });

  logger.info(`📨 Email sent successfully to: ${to}`);

  return result;
};
