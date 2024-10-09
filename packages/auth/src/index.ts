import { Google, Discord, GitHub } from "arctic";
import { env } from "../env";
import type {User as DbUser} from "@2block/db/schema";
import { absoluteUrl } from "@2block/shared/utils";

export * from "./auth";

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  absoluteUrl("/login/google/callback")
);

export const discord = new Discord(
  env.DISCORD_CLIENT_ID,
  env.DISCORD_CLIENT_SECRET,
  absoluteUrl("/login/discord/callback")
);

const isDev = env.NEXT_PUBLIC_APP_URL === "http://localhost:3000";

export const github = new GitHub(
  isDev ? env.GITHUB_LOCALHOST_CLIENT_ID : env.GITHUB_CLIENT_ID,
  isDev ? env.GITHUB_LOCALHOST_CLIENT_SECRET : env.GITHUB_CLIENT_SECRET,
  {
    redirectURI: absoluteUrl("/login/github/callback")
  }
);

export type DatabaseUserAttributes = Omit<DbUser, "hashedPassword">