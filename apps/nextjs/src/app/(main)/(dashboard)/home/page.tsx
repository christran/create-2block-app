import { redirect } from "next/navigation";
import { env } from "@/env";
import { api, HydrateClient } from "@/trpc/server";
import { type Metadata } from "next";
import { Suspense } from "react";
import { Posts } from "../_components/posts";
import { PostsSkeleton } from "../_components/posts-skeleton";
import { getSession } from "@/lib/auth/get-session";
import { Paths } from "@2block/shared/shared-constants";
import { myPostsSchema } from "@/lib/validators/posts"; // TODO: pending move to validators package
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { auth } from "@2block/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Dashboard",
  description: "View your dashboard here",
};

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const { page, perPage } = myPostsSchema.parse(searchParams);

  // const { user } = await getSession();
  // if (!user) redirect(Paths.Login);

  const { user } = await getSession();

  if (!user) redirect(Paths.Login);
  // console.log("user", user);

  /**
   * Passing multiple promises to `Promise.all` to fetch data in parallel to prevent waterfall requests.
   * Passing promises to the `Posts` component to make them hot promises (they can run without being awaited) to prevent waterfall requests.
   * @see https://www.youtube.com/shorts/A7GGjutZxrs
   * @see https://nextjs.org/docs/app/building-your-application/data-fetching/patterns#parallel-data-fetching
   */
  const promises = Promise.all([
    api.post.myPosts.prefetch({ page, perPage }),
    api.post.countUserPosts.prefetch(),
    api.stripe.getPlan.prefetch(),
  ]);

  return (
    <HydrateClient>
      <div className="mx-auto max-w-5xl px-4 md:px-2 py-8">
        <div className="flex items-center">
          <h1 className="text-[28px] leading-[34px] tracking-[-0.416px] text-slate-12 font-bold">Dashboard</h1>
        </div>
      </div>
      
      <div className="flex flex-col gap-6 mx-auto max-w-5xl px-4 md:px-2 pb-8">
        <Card>
          <CardHeader>
            <CardTitle>Posts</CardTitle>
            <CardDescription>
              
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-2xl font-bold">
              There should be something here
            </p>
            <p className="text-sm text-muted-foreground">
              Maybe some posts?
            </p>
          {/* <Suspense fallback={<PostsSkeleton />}>
              <Posts promises={promises} />
          </Suspense> */}
          </CardContent>
        </Card>
      </div>
    </HydrateClient>
  );
}
