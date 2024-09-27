import { Lucia, TimeSpan } from "lucia";
import { Google, Discord, GitHub } from "arctic";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { env } from "../env";
import { db } from "@2block/db/client";
import { sessions, users } from "@2block/db/schema";
import type {User as DbUser} from "@2block/db/schema";
import { absoluteUrl } from "@2block/shared/utils";

// Uncomment the following lines if you are using nodejs 18 or lower. Not required in Node.js 20, CloudFlare Workers, Deno, Bun, and Vercel Edge Functions.
// import { webcrypto } from "node:crypto";
// globalThis.crypto = webcrypto as Crypto;

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  getSessionAttributes: (/* attributes */) => {
    return {};
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      fullname: attributes.fullname,
      email: attributes.email,
      emailVerified: attributes.emailVerified,
      role: attributes.role,
      contactId: attributes.contactId,
      googleId: attributes.googleId,
      githubId: attributes.githubId,
      discordId: attributes.discordId,
      avatar: attributes.avatar,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
    };
  },
  sessionExpiresIn: new TimeSpan(30, "d"),
  sessionCookie: {
    name: "session",
    expires: false, // session cookies have very long lifespan (2 years)
    attributes: {
      secure: env.NODE_ENV === "production",
    },
  },
});

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

export const github = new GitHub(
  env.NODE_ENV === "production" ? env.GITHUB_CLIENT_ID : env.GITHUB_LOCALHOST_CLIENT_ID,
  env.NODE_ENV === "production" ? env.GITHUB_CLIENT_SECRET : env.GITHUB_LOCALHOST_CLIENT_SECRET,
  {
    redirectURI: absoluteUrl("/login/github/callback")
  }
);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

type DatabaseSessionAttributes = object
export type DatabaseUserAttributes = Omit<DbUser, "hashedPassword">

export { uncachedValidateRequest, validateRequest } from "./validate-request";
