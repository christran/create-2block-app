"use server";

/* eslint @typescript-eslint/no-explicit-any:0, @typescript-eslint/prefer-optional-chain:0 */

import { z } from "zod";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isWithinExpirationDate, TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
import { eq } from "drizzle-orm";
import { db } from "@2block/db/client";
import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
  resetPasswordSchema,
  updateAccountSchema,
  type updateAccountInput,
  type updatePasswordInput,
  updatePasswordSchema,
  MagicLinkInput,
  magigcLinkLoginSchema,
} from "@/lib/validators/auth";
import { emailVerificationCodes, magicLinkTokens, passwordResetTokens, users } from "@2block/db/schema";
import { getSession } from "@/lib/auth/get-session";
import { Paths } from "@2block/shared/shared-constants";
import { env } from "@/env";

import { generateId, Scrypt } from "lucia";
// import { Argon2id } from "oslo/password";

import { sendEmail, EmailTemplate } from "@2block/email";

import { logger } from "../logger";
import { tasks } from "@trigger.dev/sdk/v3";
import type { welcomeEmailTask } from "@2block/api/trigger";
import { api } from "@/trpc/server";
import { newUserNotification } from "@2block/shared/ntfy";
import { getClientIP } from "../utils";
import { auth } from "@2block/auth";

export interface ActionResponse<T> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
}

export const login = async (_: any, formData: FormData): Promise<ActionResponse<LoginInput>> => {
  const obj = Object.fromEntries(formData.entries());

  const parsed = loginSchema.safeParse(obj);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        email: err.fieldErrors.email?.[0],
        password: err.fieldErrors.password?.[0],
      },
    };
  }

  const { email, password } = parsed.data;

  const existingUser = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.email, email),
  });

  if (!existingUser) {
    return {
      formError: "Incorrect email or password",
    };
  }

  // linked account doesn't have a password set yet
  if (existingUser.password === null) {
    return {
      formError: "Incorrect email or password",
    };
  }

  // Rate limit this
	const validPassword = await new Scrypt().verify(existingUser?.password, password);

  if (!validPassword) {
    return {
      formError: "Incorrect email or password",
    };
  }

  return redirect(Paths.Dashboard);
}

export const signup = async (_: any, formData: FormData): Promise<ActionResponse<SignupInput>> => {
  const obj = Object.fromEntries(formData.entries());

  const parsed = signupSchema.safeParse(obj);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        name: err.fieldErrors.name?.[0],
        email: err.fieldErrors.email?.[0],
        password: err.fieldErrors.password?.[0],
      },
    };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.email, email),
    columns: { email: true },
  });

  if (existingUser) {
    return {
      formError: "The email is already registered with another account.",
    };
  }

  const userId = generateId(21);

  const newContact = await createContact(email, {
    userId: userId,
    name: name
  });
  
  await sendEmail(email, EmailTemplate.EmailVerification, { name, code: verificationCode });

  await newAccountTasks(name, email, newContact.contactId);


  // Redirect to /verify-email or to dashboard
  return redirect(Paths.Dashboard);
}

export const logout = async (): Promise<{ error: string } | void> => {
  const { user, session } = await validateRequest();

  if (!session) {
    return {
      error: "No session found.",
    };
  }

  cookies().set("lastKnownUserId", user.id);
  cookies().set("lastKnownEmail", user.email);

  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  return redirect(Paths.Login);
}

export const deleteAccount = async (): Promise<{ error: string } | void> => {
  const { user, session } = await validateRequest();

  if (!user) {
    return redirect(Paths.Login);
  }

  await api.user.deleteAccountByUserId({id: user.id});
  
  if (!session) {
    return {
      error: "No session found.",
    };
  }

  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  return redirect(Paths.Login);
}

export const newAccountTasks = async (name:string, email: string, contactId: string) => {
  await newUserNotification(name, email);

  const handle = await tasks.trigger<typeof welcomeEmailTask>("welcome-email", {
    name,
    email,
    contactId
  }, 
  {
    delay: "3m"
  })

  return handle;
}

export const resendVerificationEmail = async (): Promise<{ error?: string; success?: boolean; }> => {
  const { user } = await getSession();

  if (!user) {
    return redirect(Paths.Login);
  }

  const lastSent = await db.query.emailVerificationCodes.findFirst({
    where: (table, { eq }) => eq(table.userId, user.id),
    columns: { expiresAt: true },
  });

  if (lastSent && isWithinExpirationDate(lastSent.expiresAt)) {
    return {
      error: `Please wait ${timeFromNow(lastSent.expiresAt)} before resending.`,
    };
  }

  try {
    const verificationCode = await generateEmailVerificationCode(user.id, user.email);
    await sendEmail(user.email, EmailTemplate.EmailVerification, { name: user.name, code: verificationCode });
    return { success: true };
  } catch (error) {
    // Delete the code from the database if there's an error sending the email
    await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, user.id));
    console.error("Error sending verification email:", error);

    return { error: "We couldn't send a verification email. Please try again later." };
  }
}

export const verifyEmail = async (_: any, formData: FormData): Promise<{ error: string } | void> => {
  const code = formData.get("code");

  if (typeof code !== "string" || code.length !== 6) {
    return { error: "Invalid verification code." };
  }

  const { user } = await getSession();

  if (!user) {
    return redirect(Paths.Login);
  }

  const dbCode = await db.transaction(async (tx) => {
    const item = await tx.query.emailVerificationCodes.findFirst({
      where: (table, { eq }) => eq(table.userId, user.id),
    });
    if (item) {
      await tx.delete(emailVerificationCodes).where(eq(emailVerificationCodes.id, item.id));
    }
    return item;
  });

  if (!dbCode || dbCode.code !== code) return { error: "Invalid verification code." };

  if (!isWithinExpirationDate(dbCode.expiresAt)) return { error: "Verification code expired." };

  if (dbCode.email !== user.email) return { error: "Email does not match." };

  await lucia.invalidateUserSessions(user.id);
  await db.update(users).set({ emailVerified: true }).where(eq(users.id, user.id));
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  redirect(Paths.Dashboard);
}

// Rate limit this
export const sendPasswordResetLink = async (
  _: any,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> => {
  const email = formData.get("email");
  const parsed = z.string().trim().email().safeParse(email);

  if (!parsed.success) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const user = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.email, parsed.data),
  });

  if (user) {
    try {
      const lastSent = await db.query.passwordResetTokens.findFirst({
        where: (table, { eq }) => eq(table.userId, user?.id),
        columns: { expiresAt: true },
      });
    
      if (lastSent && isWithinExpirationDate(lastSent.expiresAt)) {
        return {
          error: `Please wait ${timeFromNow(lastSent.expiresAt)} before resending.`,
        };
      }

      // should we care if email is verified to reset password?
      // if (!user || !user.emailVerified) return { error: "No account associated with this email address." };

      // "if the email exists then you should get the email"
      if (!user) return { success: true };
    
      const verificationToken = await generatePasswordResetToken(user.id);

      const verificationLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password/${verificationToken}`;

      await sendEmail(user.email, EmailTemplate.PasswordReset, { name: user.name, url: verificationLink });

      return { success: true };
    } catch (error) {
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
      console.error("Error sending password reset email:", error);

      return { success: false, error: "We couldn't send a password reset email. Please try again later." };
    }
  } else {
    return { success: true };
  }
}

// Rate limit this
export const setupNewPasswordLink = async (): Promise<{ success?: boolean; error?: string; }> => {
  const { user } = await getSession();

  if (!user) {
    return redirect(Paths.Login);
  }

  try {
    const lastSent = await db.query.passwordResetTokens.findFirst({
      where: (table, { eq }) => eq(table.userId, user?.id),
      columns: { expiresAt: true },
    });
  
    if (lastSent && isWithinExpirationDate(lastSent.expiresAt)) {
      return {
        error: `Please wait ${timeFromNow(lastSent.expiresAt)} before resending.`,
      };
    }

    // should we care if email is verified to reset password?
    // if (!user || !user.emailVerified) return { error: "No account associated with this email address." };

    // "if the email exists then you should get the email"
    if (!user) return { success: true };
  
    const verificationToken = await generatePasswordResetToken(user.id);

    const verificationLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password/${verificationToken}`;

    await sendEmail(user.email, EmailTemplate.PasswordReset, { name: user.name, url: verificationLink });

    return { success: true };
  } catch (error) {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
    console.error("Error sending password reset email:", error);

    return { success: false, error: "We couldn't send a new password setup email. Please try again later" };
  }
}

export const resetPassword = async (_: any, formData: FormData): Promise<{ success?: boolean; error?: string;}> => {
  const obj = Object.fromEntries(formData.entries());

  const parsed = resetPasswordSchema.safeParse(obj);

  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      error: err.fieldErrors.password?.[0] ?? err.fieldErrors.token?.[0],
    };
  }
  const { token, password } = parsed.data;
  
  redirect(Paths.Dashboard);
}

export const updateAccount = async (_: any, formData: FormData): Promise<ActionResponse<updateAccountInput> & { success?: boolean; error?: string }> => {
  const { user } = await getSession();

  if (!user) {
    return redirect(Paths.Login);
  }

  const obj = Object.fromEntries(formData.entries());
  const parsed = updateAccountSchema.safeParse(obj);

  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        name: err.fieldErrors.name?.[0],
        // email: err.fieldErrors.email?.[0],
      },
    };
  }

  // const { name, email } = parsed.data;
  const { name } = parsed.data;

  // const existingUser = await db.query.users.findFirst({
  //   where: (table, { eq }) => eq(table.email, email),
  //   columns: { email: true },
  // });

  // if (existingUser) {
  //   return {
  //     error: "This email address is already associated with another account.",
  //   };
  // }

  // const userData = await db.query.users.findFirst({
  //   where: (table, { eq }) => eq(table.id, user.id),
  // });

  // email input disabled on client side, force on server side
  // const newEmail = (userData?.password ? email : userData?.email)

  // Force reverify after updating email
  try {
    await db.update(users).set({ 
      name,
      // email: newEmail,
      // emailVerified: userData?.password && email !== user.email ? false : userData?.emailVerified
    }).where(eq(users.id, user.id));

    // revalidatePath(Paths.Settings);
    // redirect(Paths.Settings);

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { 
      error: "Failed to update user information" 
    };
  }
}

export const updatePassword = async (_: any, formData: FormData): Promise<ActionResponse<updatePasswordInput> & { success?: boolean; error?: string }> => {
  const { user } = await getSession();

  if (!user) {
    return redirect(Paths.Login);
  }

  const obj = Object.fromEntries(formData.entries());

  const parsed = updatePasswordSchema.safeParse(obj);

  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        current_password: err.fieldErrors.current_password?.[0],
        new_password: err.fieldErrors.new_password?.[0],
        confirm_password: err.fieldErrors.confirm_password?.[0]
      },
    };
  }

  const { current_password, new_password } = parsed.data;

  // Force reverify after updating email
  try {

    // revalidatePath(Paths.Security);
    // redirect(Paths.Security);
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "Failed to update user information" };
  }
}

export const resendMagicLink = async (
  _: any,
  formData: FormData,
): Promise<{ success?: boolean; error?: string;}> => {
  const obj = Object.fromEntries(formData.entries());
  const parsed = magigcLinkLoginSchema.safeParse(obj);

  if (!parsed.success) {
    return { 
      error: "Please enter a valid email address." 
    };
  }

  const { email } = parsed.data;

  const user = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.email, email),
  });

  if (user) {
    const lastSent = await db.query.magicLinkTokens.findFirst({
      where: (table, { eq }) => eq(table.userId, user?.id),
      columns: { expiresAt: true },
    });
  
    if (lastSent && isWithinExpirationDate(lastSent.expiresAt)) {
      return {
        error: `Please wait ${timeFromNow(lastSent.expiresAt)} before resending a magic link.`,
      };
    }
  
    await auth.api.signInMagicLink({
      body: {
        email,
        callbackURL: Paths.Dashboard
      },
      headers: headers()
    })

    return { success: true };
  }

  return { 
    error: "We couldn't send a magic link. Please try again later."
  };
}

export const sendMagicLink = async (
  _: any,
  formData: FormData,
): Promise<ActionResponse<MagicLinkInput> & { success?: boolean; error?: string }> => {
  const obj = Object.fromEntries(formData.entries());

  const parsed = magigcLinkLoginSchema.safeParse(obj);

  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        email: err.fieldErrors.email?.[0],
      },
    };
  }

  const { email } = parsed.data;

  await auth.api.signInMagicLink({
    body: {
      email,
      callbackURL: Paths.Dashboard
    },
    headers: headers()
  })

  return redirect(`${Paths.MagicLink}?email=${encodeURIComponent(email)}`);
}