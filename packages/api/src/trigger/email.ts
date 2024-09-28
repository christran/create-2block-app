import { Paths } from "@2block/shared/shared-constants";
import { deleteContactById } from "@2block/email/actions";
import { sendEmail, EmailTemplate } from "@2block/email/email-service";
import { logger, task } from "@trigger.dev/sdk/v3";

export const welcomeEmailTask = task({
  id: "welcome-email",
  run: async (payload: {
    fullname: string,
    email: string;
    contactId: string
  }, { ctx }) => {
    logger.log( `📨 Sending Welcome Email to: ${payload.email}`);

    await sendEmail(payload.email, EmailTemplate.Welcome, { 
      fullname: payload.fullname,
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
    fullname: string,
    email: string;
    contactId: string
  }, { ctx }) => {
    logger.log( `📨 Sending Account Deleted Email to: ${payload.email}`);
  
    await sendEmail(payload.email, EmailTemplate.AccountDeleted, { 
      fullname: payload.fullname,
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