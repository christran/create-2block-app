import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ExclamationTriangleIcon } from "@/components/icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { api } from "@/trpc/server";
import { Suspense } from "react";
import { Billing } from "./_components/billing";
import { BillingSkeleton } from "./_components/billing-skeleton";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Billing",
  description: "Manage your billing and subscription",
};

export default async function BillingPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect(Paths.Login);
  }

  const stripePromises = Promise.all([api.stripe.getPlans.query(), api.stripe.getPlan.query()]);

  return (
      <>
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center">
            <h1 className="text-[28px] leading-[34px] tracking-[-0.416px] text-slate-12 font-bold">Billing</h1>
          </div>
        </div>
        <div className="flex flex-col gap-6 mx-auto max-w-5xl px-6">
          <section>
            <Alert className="p-6 [&>svg]:left-6 [&>svg]:top-6 [&>svg~*]:pl-10 rounded-lg border">
              <ExclamationTriangleIcon className="h-6 w-6 !text-red-500" />
              <AlertTitle>Stripe Test Environment</AlertTitle>
              <AlertDescription>
                Stripe test environment enabled. Use test cards provided {" "}
                <a
                  href="https://docs.stripe.com/testing#cards"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:underline dark:text-teal-500"
                >
                  here
                </a>
                .
              </AlertDescription>
            </Alert>
          </section>
          <Suspense fallback={<BillingSkeleton />}>
            <Billing stripePromises={stripePromises} />
          </Suspense>
        </div>
      </>
  );
}
