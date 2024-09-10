import { env } from "@/env";
import { Paths } from "@/lib/constants";
import { deleteContactById } from "@/lib/email/actions";
import { sendEmail, EmailTemplate } from "@/lib/email/plunk";
import { logger, task, wait } from "@trigger.dev/sdk/v3";

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
      url: `${env.NEXT_PUBLIC_APP_URL}/${Paths.Dashboard}`, 
      unsubscribe: `${Paths.Unsubscribe}/${payload.contactId}` 
    });
  },
  handleError: async (payload, err, { ctx, retryAt }) => {
    logger.log("Error:", { err });
  },
});

export const accountDeletedTask = task({
  id: "account-deleted",
  run: async (payload: {
    fullname: string,
    email: string;
    contactId: string
  }, { ctx }) => {
    logger.log( `📨 Sending Account Deleted Email to: ${payload.email}`);
    logger.log( `GitHub Action Test`);
  
    await sendEmail(payload.email, EmailTemplate.AccountDeleted, { 
      fullname: payload.fullname,
      url: `${env.NEXT_PUBLIC_APP_URL}/${Paths.Dashboard}`, 
      unsubscribe: `${Paths.Unsubscribe}/${payload.contactId}` 
    });

    // delete or unsubsubscribe contact?
    await deleteContactById(payload.contactId);
  },
  handleError: async (payload, err, { ctx, retryAt }) => {
    logger.log("Error:", { err });
  },
});