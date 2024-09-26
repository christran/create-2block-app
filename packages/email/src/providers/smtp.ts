import { createTransport  } from "nodemailer";
import type {TransportOptions} from "nodemailer";
import { EMAIL_SENDER } from "@2block/shared/shared-constants";

export const sendEmailSMTP = async (to: string, subject: string, body: string) => {
  const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  };
  
  const transporter = createTransport(smtpConfig as TransportOptions);
  
  const result = await transporter.sendMail({ 
    from: EMAIL_SENDER, 
    to, 
    subject, 
    html: body 
  });

  console.log(`📨 Email sent successfully to: ${to}`);

  return result;
};
