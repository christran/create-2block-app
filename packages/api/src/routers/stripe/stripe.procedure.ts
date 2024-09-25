import type { TRPCRouterRecord } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import type { ProtectedTRPCContext } from "../../trpc"; // TODO: deprecated
import { freePlan, proPlan, proPlus, subscriptionPlans } from "@2block/shared/subscriptions";
import { stripe } from "../../lib/stripe";
import { absoluteUrl, formatPrice } from "@2block/shared/utils";
import { Paths } from "@2block/shared/shared-constants";
import { type ManageSubscriptionInput, manageSubscriptionSchema } from "./stripe.input";

export const stripeRouter = {
  getPlans: protectedProcedure.
    query(({ ctx }) => getStripePlans(ctx)),

  getPlan: protectedProcedure.
    query(({ ctx }) => getStripePlan(ctx)),

  managePlan: protectedProcedure
    .input(manageSubscriptionSchema)
    .mutation(({ ctx, input }) => manageSubscription(ctx, input)),
} satisfies TRPCRouterRecord;

const getStripePlans = async (ctx: ProtectedTRPCContext) => {
  try {
    const user = await ctx.db.query.users.findFirst({
      where: (table, { eq }) => eq(table.id, ctx.user.id),
      columns: {
        id: true,
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const proPrice = await stripe.prices.retrieve(proPlan.stripePriceId);
    const proPlusPrice = await stripe.prices.retrieve(proPlus.stripePriceId);

    return subscriptionPlans.map((plan) => ({
      ...plan,
      price:
        plan.stripePriceId === proPlan.stripePriceId
          ? formatPrice((proPrice.unit_amount ?? 0) / 100, {
              currency: proPrice.currency,
            })
          : plan.stripePriceId === proPlus.stripePriceId
          ? formatPrice((proPlusPrice.unit_amount ?? 0) / 100, {
              currency: proPlusPrice.currency,
            })
          : formatPrice(0, { currency: proPrice.currency }),
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
};

const getStripePlan = async (ctx: ProtectedTRPCContext) => {
  try {
    const user = await ctx.db.query.users.findFirst({
      where: (table, { eq }) => eq(table.id, ctx.user.id),
      columns: {
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    // Check if user is on a paid plan
    const isPaid =
      !!user.stripePriceId &&
      (user.stripeCurrentPeriodEnd?.getTime() ?? 0) + 86_400_000 > Date.now();

    let plan = freePlan;
    if (isPaid) {
      plan = user.stripePriceId === proPlus.stripePriceId ? proPlus : proPlan;
    }

    // Check if user has canceled subscription
    let isCanceled = false;
    
    if (isPaid && !!user.stripeSubscriptionId) {
      const stripePlan = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      isCanceled = stripePlan.cancel_at_period_end;
    }

    return {
      ...plan,
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
      stripeCustomerId: user.stripeCustomerId,
      isPro: isPaid && plan.stripePriceId === proPlan.stripePriceId,
      isProPlus: isPaid && plan.stripePriceId === proPlus.stripePriceId,
      isCanceled,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};

const manageSubscription = async (
  ctx: ProtectedTRPCContext,
  input: ManageSubscriptionInput,
) => {
  const billingUrl = absoluteUrl(Paths.Billing);

  const user = await ctx.db.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, ctx.user.id),
    columns: {
      id: true,
      email: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripePriceId: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  // If the user is already subscribed to a plan, we redirect them to the Stripe billing portal
  if ((input.isPro || input.isProPlus) && input.stripeCustomerId) {
    const stripeSession = await ctx.stripe.billingPortal.sessions.create({
      customer: input.stripeCustomerId,
      return_url: billingUrl,
    });

    return {
      url: stripeSession.url,
    };
  }

  // If the user is not subscribed to a plan, we create a Stripe Checkout session
  const stripeSession = await ctx.stripe.checkout.sessions.create({
    success_url: billingUrl,
    cancel_url: billingUrl,
    allow_promotion_codes: true,
    // payment_method_types: ["card"],
    mode: "subscription",
    billing_address_collection: "auto",
    customer_email: user.email,
    // consent_collection: {
    //   promotions: "auto",
    //   terms_of_service: "required"
    // },
    line_items: [
      {
        price: input.stripePriceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        userId: user.id,
      },
    },
    metadata: {
      userId: user.id,
    },
  });

  return {
    url: stripeSession.url,
  };
};

export const createBillingPortalSession = async (customerId: string) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL + Paths.Billing}`,
  })
  
  return session.url
}
