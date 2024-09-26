/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { EMAIL_SENDER } from "@2block/shared/shared-constants";

export const sendEmailSES = async (to: string, subject: string, body: string) => {
  const sesClient = new SESv2Client({
    region: "us-west-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
    }
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
  
  console.log(`📨 Email sent successfully to: ${to}`);
  
  return result;
};
