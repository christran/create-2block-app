import { headers } from "next/headers";

import type Stripe from "stripe";

import { env } from "@/env";
import { stripe } from "@/lib/stripe";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown error."}`,
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      console.log("checkout.session.completed");

      const checkoutSessionCompleted = event.data.object;

      const userId = checkoutSessionCompleted?.metadata?.userId;

      if (!userId) {
        return new Response("User id not found in checkout session metadata.", {
          status: 404,
        });
      }

      // Retrieve the subscription details from Stripe
      const subscription = await stripe.subscriptions.retrieve(
        checkoutSessionCompleted.subscription as string,
      );

      // Update the user stripe into in our database
      // Since this is the initial subscription, we need to update
      // the subscription id and customer id
      await db
        .update(users)
        .set({
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
        })
        .where(eq(users.id, userId));

      break;
    }
    case "invoice.payment_succeeded": {
      console.log("invoice.payment_succeeded");

      const invoicePaymentSucceeded = event.data.object;

      const userId = invoicePaymentSucceeded?.metadata?.userId;

      if (!userId) {
        return new Response("User id not found in invoice metadata.", {
          status: 404,
        });
      }

      // Retrieve the subscription details from Stripe
      const subscription = await stripe.subscriptions.retrieve(
        invoicePaymentSucceeded.subscription as string,
      );

      // Update the price id and set the new period end
      await db
        .update(users)
        .set({
          stripePriceId: subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
        })
        .where(eq(users.id, userId));

      break;
    }
    case "customer.subscription.updated": {
      // Triggers when admin updates a user's subscription directly on the Stripe dashboard
      console.log("customer.subscription.updated");

      const subscriptionUpdated = event.data.object;

      const customerId = subscriptionUpdated?.customer;

      if (!customerId) {
        return new Response("Customer id not found in database.", {
          status: 404,
        });
      }

      // Retrieve the subscription details from Stripe
      const subscription = await stripe.subscriptions.retrieve(
        subscriptionUpdated.id,
      );

      // Reason: cancellation_requested, admin canceled with custom date
      if (subscription.cancellation_details?.reason) {
        const subscription = await stripe.subscriptions.update(
          subscriptionUpdated.id,
          {
            cancel_at_period_end: true
          }
        );
      }

      // Update the user stripe into in our database
      // Since this is the initial subscription, we need to update
      // the subscription id and customer id
      await db
        .update(users)
        .set({
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
        })
        .where(eq(users.stripeCustomerId, customerId as string));

      break;
    }
    case "customer.subscription.deleted": {
      // Triggers when admin cancels a user's subscription directly on the Stripe dashboard
      console.log("customer.subscription.deleted");

      const subscriptionDeleted = event.data.object;

      const customerId = subscriptionDeleted.customer;
        
      if (!customerId) {
        return new Response("Customer id not found in database.", {
          status: 404,
        });
      }

      await db
        .update(users)
        .set({
          stripeSubscriptionId: null,
          stripeCustomerId: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: null,
        })
        .where(eq(users.stripeCustomerId, customerId as string));

      break;
    }
    default:
      console.warn(`Unhandled stripe event type: ${event.type}`);
  }

  return new Response(null, { status: 200 });
}
