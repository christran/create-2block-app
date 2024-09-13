import { env } from "@/env";

export interface SubscriptionPlan {
  name: string;
  description: string;
  features: string[];
  stripePriceId: string;
}

export const freePlan: SubscriptionPlan = {
  name: "Free",
  description: "The Free Plan is limited so you should just upgrade",
  features: ["No Features", "Limited Support"],
  stripePriceId: "",
};

export const proPlan: SubscriptionPlan = {
  name: "Unlimited",
  description: "The Unlimited Plan is unlimited so it's must be good",
  features: ["Unlimited Everything", "Access to Claude 3.5 Sonnet", "Access to gpt-4o + gpt-o1", "Priority Support", "Access to Discord Server"],
  stripePriceId: env.STRIPE_PRO_MONTHLY_PLAN_ID,
};

export const proPlus: SubscriptionPlan = {
  name: "Unlimited+",
  description: "The Unlimited+ Plan is unlimited so it's must be good",
  features: ["Everything from Unlimited", "Access to AGI", "Priority Support", "Access to Discord Server"],
  stripePriceId: env.STRIPE_PRO_PLUS_MONTHLY_PLAN_ID,
};


export const subscriptionPlans = [freePlan, proPlan, proPlus];
