import { protectedProcedure, createTRPCRouter } from "@/server/api/trpc";
import * as inputs from "./user.input";
import * as services from "./user.service";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure
    .query(({ ctx }) => services.getUserById(ctx)),
});
