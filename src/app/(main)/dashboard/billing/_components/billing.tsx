import Link from "next/link";
import { CheckCircledIcon } from "@/components/icons";
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
import { createBillingPortalSession } from "@/server/api/routers/stripe/stripe.procedure";
import { proPlan, proPlus } from "@/config/subscriptions";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Paths } from "@/lib/constants";

interface BillingProps {
  stripePromises: Promise<
    [RouterOutputs["stripe"]["getPlans"], RouterOutputs["stripe"]["getPlan"]]
  >;
}

export async function Billing({ stripePromises }: BillingProps) {
  const [plans, plan] = await stripePromises;

  const getButtonText = (itemName: string) => {
    if (itemName === "Free") {
      return plan?.isPro || plan?.isProPlus ? "Upgraded" : "Continue";
    }
    if (plan?.isCanceled) return "Resubscribe";
    if (plan?.isPro && itemName === proPlus.name) return "Upgrade";
    if (plan?.isProPlus && itemName === proPlan.name) return "Downgrade";
    if (plan?.isPro || plan?.isProPlus) return "Manage Plan";
    return "Subscribe";
  };

  return (
    <>
      <section>
        <Card className="space-y-2 p-8 rounded-lg border border-slate-6">
          <h3 className="text-lg font-semibold sm:text-xl">Subscription</h3>
          <h4 className="text-lg font-semibold sm:text-xl">{plan?.name ?? "Free"}</h4>
          <p className="text-sm text-muted-foreground">
          {!plan?.isPro && !plan?.isProPlus
            ? "The Free Plan is limited. Upgrade to unlock unlimited access to all features"
            : plan.isCanceled
              ? <>
                  {`Your subscription will end on `}
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
                </>
          }
          </p>
        </Card>
      </section>
      {/* Weekly/Monthly Toggle */}
      {/* <div className="flex items-center justify-center justify-end space-x-2">
        <Label htmlFor="billing-toggle">Weekly</Label>
        <Switch
          id="billing-toggle"
          // checked={!isMonthly}
          // onCheckedChange={toggleBillingPeriod}
        />
        <Label htmlFor="billing-toggle">Monthly</Label>
      </div> */}
      <section className="grid gap-6 lg:grid-cols-3">
        {plans.map((item) => (
          <Card key={item.name} className="flex flex-col p-2 rounded-lg border border-slate-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{item.name}</CardTitle>
              <CardDescription className="h-12 text-sm">{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{item.price}</span>
                <span className="ml-1 text-sm text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircledIcon className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-4">
              {item.name === "Free" ? (
                <Button className="w-full" disabled={plan?.isPro || plan?.isProPlus}>
                  <Link href={Paths.Dashboard} className="w-full">
                    {plan?.isPro || plan?.isProPlus ? "Upgraded" : "Continue"}
                  </Link>
                </Button>
              ) : (
                <ManageSubscriptionForm
                  stripePriceId={item.stripePriceId}
                  isPro={plan?.isPro ?? false}
                  isProPlus={plan?.isProPlus ?? false}
                  isCanceled={plan?.isCanceled ?? false}
                  stripeCustomerId={plan?.stripeCustomerId}
                  stripeSubscriptionId={plan?.stripeSubscriptionId}
                  buttonText={getButtonText(item.name)}
                />
              )}
            </CardFooter>
          </Card>
        ))}
      </section>
    </>
  );
}
