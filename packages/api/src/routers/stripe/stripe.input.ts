import { z } from "zod";

export const manageSubscriptionSchema = z.object({
  stripePriceId: z.string(),
  stripeCustomerId: z.string().optional().nullable(),
  stripeSubscriptionId: z.string().optional().nullable(),
  isPro: z.boolean(),
  isProPlus: z.boolean(),
  isCanceled: z.boolean(),
  buttonText: z.string(),
});

export type ManageSubscriptionInput = z.infer<typeof manageSubscriptionSchema>;
