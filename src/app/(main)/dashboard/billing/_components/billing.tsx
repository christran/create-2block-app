import Link from "next/link";

import { CheckIcon } from "@/components/icons";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { type RouterOutputs } from "@/trpc/shared";
import { ManageSubscriptionForm } from "./manage-subscription-form";
import { createBillingPortalSession } from "@/server/api/routers/stripe/stripe.service";

interface BillingProps {
  stripePromises: Promise<
    [RouterOutputs["stripe"]["getPlans"], RouterOutputs["stripe"]["getPlan"]]
  >;
}

export async function Billing({ stripePromises }: BillingProps) {
  const [plans, plan] = await stripePromises;

  return (
    <>
      <section>
        <Card className="space-y-2 p-8">
          <h3 className="text-lg font-semibold sm:text-xl">Subscription</h3>
          <h4 className="text-lg font-semibold sm:text-xl">{plan?.name ?? "Free"}</h4>
          <p className="text-sm text-muted-foreground">
            {!plan?.isPro
              ? "The Free Plan is limited. Upgrade to to unlock unlimited to access all the features."
              : plan.isCanceled
                ? <>
                    {`Your subscription will be canceled on `}
                    <span className="font-semibold">
                      {plan?.stripeCurrentPeriodEnd ? formatDate(plan.stripeCurrentPeriodEnd) : null}
                    </span>
                    {`. `}
                    {plan?.stripeCustomerId && (
                      <Link href={await createBillingPortalSession(plan.stripeCustomerId)} className="underline">
                        Click here to resubscribe
                      </Link>
                    )}
                  </>
                : <>
                    Your subscription renews on{" "}
                    <span className="font-semibold">
                      {plan?.stripeCurrentPeriodEnd ? formatDate(plan.stripeCurrentPeriodEnd) : null}
                    </span>
                  </>}
          </p>
        </Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        {plans.map((item) => (
          <Card key={item.name} className="flex flex-col p-2">
            <CardHeader className="h-full">
              <CardTitle className="line-clamp-1">{item.name}</CardTitle>
              <CardDescription className="line-clamp-2">{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="h-full flex-1 space-y-6">
              <div className="text-3xl font-bold">
                {item.price}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              <div className="space-y-2">
                {item.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="aspect-square shrink-0 rounded-full bg-foreground p-px text-background">
                      <CheckIcon className="size-4" aria-hidden="true" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              {item.name === "Free" ? (
                <Link href="/dashboard" className="w-full">
                  <Button className="w-full" disabled={plan?.isPro} asChild>
                    <span>
                      {plan?.isPro ? "Upgraded" : "Continue"}
                      <span className="sr-only">
                        {plan?.isPro ? "You are currently on the Pro plan" : "Continue with Free plan"}
                      </span>
                    </span>
                  </Button>
                </Link>
              ) : (
                <ManageSubscriptionForm
                  stripePriceId={item.stripePriceId}
                  isPro={plan?.isPro ?? false}
                  isCanceled={plan?.isCanceled ?? false}
                  stripeCustomerId={plan?.stripeCustomerId}
                  stripeSubscriptionId={plan?.stripeSubscriptionId}
                />
              )}
            </CardFooter>
          </Card>
        ))}
      </section>
    </>
  );
}
