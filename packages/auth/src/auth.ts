import { db } from "@2block/db/client";
import { users, accounts, verifications, sessions } from "@2block/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink, passkey, twoFactor } from "better-auth/plugins";
import { env } from "../env";
import { createContact } from "@2block/email/actions";
import { tasks } from "@trigger.dev/sdk/v3";
// import type { welcomeEmailTask } from "@2block/api/trigger"; // can't have api as a dependency here because circular dependency
import type { welcomeEmailTask } from "../../api/src/trigger";
import { newUserNotification } from "@2block/shared/ntfy";
import { sendEmail, EmailTemplate } from "@2block/email";

const isDev = env.NODE_ENV !== "production" || env.NEXT_PUBLIC_APP_URL === "http://localhost:3000";

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      account: accounts,
      verification: verifications,
      session: sessions,
    },
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const newContact = await createContact(user.email, {
            userId: user.id,
            name: user.name
          });

          await newUserNotification(user.name, user.email);

          await tasks.trigger<typeof welcomeEmailTask>("welcome-email", {
            name: user.name,
            email: user.email,
            contactId: newContact.contactId
          }, 
          {
            delay: "3m"
          })

          return Promise.resolve({
            data: {
              ...user,
              contactId: newContact.contactId,
              // ipAddress: user.ipAddress, // TODO: get IP address
              role: "default"
            }
          });
        },
        after: async (user) => {
          // await newUserNotification(user.name, user.email);

          return Promise.resolve();
        },
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(token, user) {
      console.log("sendResetPassword", token, user);
    },
    sendEmailVerificationOnSignUp: true,
    async sendEmailVerification(email, url) {
      console.log("sendEmailVerification", email, url);
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async (data: {
        email: string,
        token: string,
        url: string
      }) => {
        const user = await db.query.users.findFirst({
          where: (table, { eq }) => eq(table.email, data.email)
        })

        await sendEmail(data.email, EmailTemplate.MagicLink, { name: user?.name ?? "", url: data.url });
      }
    }),
		twoFactor({
			otpOptions: {
				sendOTP(user, otp) {
					console.log({ otp });
				},
			},
		}),
		passkey(),
  ],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    },
    github: {
      clientId: isDev ? env.GITHUB_LOCALHOST_CLIENT_ID : env.GITHUB_CLIENT_ID,
      clientSecret: isDev ? env.GITHUB_LOCALHOST_CLIENT_SECRET : env.GITHUB_CLIENT_SECRET,
    },
  },
  advanced: {
    disableCSRFCheck: false
  },
  logLevel: {
    debug: false,
    verboseLogging: true
  }
});