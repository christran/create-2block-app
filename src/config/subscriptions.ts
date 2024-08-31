import { env } from "@/env";

export interface SubscriptionPlan {
  name: string;
  description: string;
  features: string[];
  stripePriceId: string;
}

export const freePlan: SubscriptionPlan = {
  name: "Free",
  description: "The Free plan is limited to 2 posts.",
  features: ["Up to 2 posts", "Limited support"],
  stripePriceId: "",
};

export const proPlan: SubscriptionPlan = {
  name: "Unlimited",
  description: "The Unlimited plan has unlimited posts.",
  features: ["Unlimited posts", "Priority support", "Access to Discord server"],
  stripePriceId: env.STRIPE_PRO_MONTHLY_PLAN_ID,
};

export const subscriptionPlans = [freePlan, proPlan];
