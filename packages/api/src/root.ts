import { filesRouter } from "./routers/files/files.procedure";
import { postRouter } from "./routers/post/post.procedure";
import { stripeRouter } from "./routers/stripe/stripe.procedure";
import { userRouter } from "./routers/user/user.procedure";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  files: filesRouter,
  post: postRouter,
  stripe: stripeRouter,
});

export type AppRouter = typeof appRouter;
