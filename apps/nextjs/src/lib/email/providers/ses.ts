import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { env } from "@/env";
import { logger } from "../../logger";
import { EMAIL_SENDER } from "@/lib/constants";

export const sendEmailSES = async (to: string, subject: string, body: string) => {
  const sesClient = new SESv2Client({ 
    region: 'us-west-1',
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    },
  });

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
};
