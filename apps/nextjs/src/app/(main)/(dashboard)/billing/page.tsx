import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ExclamationTriangleIcon } from "@/components/icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { env } from "@/env";
import { validateRequest } from "@2block/auth";
import { Paths } from "@2block/shared/shared-constants";
import { caller } from "@/trpc/server";
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

  const stripePromises = Promise.all([caller.stripe.getPlans(), caller.stripe.getPlan()]);

  return (
      <>
        <div className="mx-auto max-w-5xl px-4 md:px-2 py-8">
          <div className="flex items-center">
            <h1 className="text-[28px] leading-[34px] tracking-[-0.416px] text-slate-12 font-bold">Billing</h1>
          </div>
        </div>
        <div className="flex flex-col gap-6 mx-auto max-w-5xl px-4 md:px-2 pb-8">
          <section>
            <Alert className="p-4 sm:p-6 [&>svg]:left-4 [&>svg]:top-4 sm:[&>svg]:left-6 sm:[&>svg]:top-6 [&>svg~*]:pl-8 sm:[&>svg~*]:pl-10">
              <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 !text-red-500" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-grow">
                  <AlertTitle className="text-sm sm:text-base">Stripe Test Environment</AlertTitle>
                  <AlertDescription className="text-xs sm:text-sm mt-1">
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
                </div>
              </div>
            </Alert>
          </section>
          <Suspense fallback={<BillingSkeleton />}>
            <Billing stripePromises={stripePromises} />
          </Suspense>
        </div>
      </>
  );
}
