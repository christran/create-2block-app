/*
Environment Variables that need to be set on trigger.dev PROD

NEXT_PUBLIC_APP_URL
EMAIL_SERVER
PLUNK_API_KEY
RESEND_API_KEY
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
MOCK_SEND_EMAIL
*/

import { Paths } from "@2block/shared/shared-constants";
import { deleteContactById } from "@2block/email/actions";
import { sendEmail, EmailTemplate } from "@2block/email/email-service";
import { logger, task } from "@trigger.dev/sdk/v3";

export const welcomeEmailTask = task({
  id: "welcome-email",
  run: async (payload: {
    name: string,
    email: string;
    contactId: string
  }, { ctx }) => {
    logger.log( `📨 Sending Welcome Email to: ${payload.email}`);

    await sendEmail(payload.email, EmailTemplate.Welcome, { 
      name: payload.name,
      url: `${process.env.NEXT_PUBLIC_APP_URL}${Paths.Dashboard}`, 
      unsubscribe: `${Paths.Unsubscribe}/${payload.contactId}` 
    });
  },
  handleError: (payload, err, { ctx, retryAt }) => {
    logger.log("Error:", { err });
  },
});

export const accountDeletedTask = task({
  id: "account-deleted",
  retry: {
    maxAttempts: 1,
  },
  run: async (payload: {
    name: string,
    email: string;
    contactId: string
  }, { ctx }) => {
    logger.log( `📨 Sending Account Deleted Email to: ${payload.email}`);
  
    await sendEmail(payload.email, EmailTemplate.AccountDeleted, { 
      name: payload.name,
      url: `${process.env.NEXT_PUBLIC_APP_URL}${Paths.Dashboard}`, 
      unsubscribe: `${Paths.Unsubscribe}/${payload.contactId}` 
    });

    await deleteContactById(payload.contactId);
  },
  handleError: (payload, err, { ctx, retryAt }) => {
    logger.log("Error:", { err });

    // handle this error
    // Error deleting contact: Error: That contact was not found at deleteContactById.
  },
});