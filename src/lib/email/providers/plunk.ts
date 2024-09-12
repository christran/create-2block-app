import { env } from "@/env";
import { logger } from "../../logger";
import { EMAIL_SENDER_NAME, EMAIL_SENDER_ADDRESS } from "@/lib/constants";

interface PlunkApiResponse {
  success: boolean;
  emails?: Array<{ contact: { id: string, email: string } }>;
  timestamp?: string;
  error?: string;
  message?: string;
  time?: string;
}

export const sendEmailPlunk = async (to: string, subject: string, body: string) => {
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
};
