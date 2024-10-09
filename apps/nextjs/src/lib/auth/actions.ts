"use server";

/* eslint @typescript-eslint/no-explicit-any:0, @typescript-eslint/prefer-optional-chain:0 */

import { z } from "zod";
import { cookies } from "next/headers";
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
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@2block/shared/shared-constants";
import { env } from "@/env";

import { nanoid } from "nanoid";
import { hash, verify } from "@node-rs/argon2";

import { sendEmail, EmailTemplate } from "@2block/email/email-service";

import { logger } from "../logger";
import { tasks } from "@trigger.dev/sdk/v3";
import { createContact } from "@2block/email/actions";
import type { welcomeEmailTask } from "@2block/api/trigger";
import { api } from "@/trpc/server";
import { newUserNotification } from "@2block/shared/ntfy";
import { getClientIP } from "../utils";
import { createSession, generateSessionToken, invalidateAllUserSessions, invalidateSession } from "@2block/auth";
import { deleteSessionCookie, setSessionCookie } from "./session";

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
  if (existingUser.hashedPassword === null) {
    return {
      formError: "Incorrect email or password",
    };
  }

  // Rate limit this
  const validPassword = await verifyPassword(existingUser.hashedPassword, password);

  if (!validPassword) {
    return {
      formError: "Incorrect email or password",
    };
  }

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, existingUser.id);
  setSessionCookie(sessionToken, session.expiresAt);

  await db.update(users).set({ ipAddress: getClientIP() }).where(eq(users.id, existingUser.id));

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

  const userId = nanoid();
  const hashedPassword = await hashPassword(password);

  const newContact = await createContact(email, {
    userId: userId,
    name: name
  });
  
  const verificationCode = await generateEmailVerificationCode(userId, email);

  await sendEmail(email, EmailTemplate.EmailVerification, { name, code: verificationCode });

  await newAccountTasks(name, email, newContact.contactId);

  await db.insert(users).values({
    id: userId,
    name,
    email,
    ipAddress: getClientIP(),
    hashedPassword,
    role: "default",
    contactId: newContact.contactId ?? null
  });

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, userId);
  setSessionCookie(sessionToken, session.expiresAt);

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

  await invalidateSession(session.id);
  deleteSessionCookie();

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

  await invalidateSession(session.id);
  deleteSessionCookie();

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
  const { user } = await validateRequest();

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

  const { user } = await validateRequest();

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

  await invalidateAllUserSessions(user.id);
  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  setSessionCookie(sessionToken, session.expiresAt);

  await db.update(users).set({ emailVerified: true }).where(eq(users.id, user.id));

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
  const { user } = await validateRequest();

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

  const dbToken = await db.transaction(async (tx) => {
    const item = await tx.query.passwordResetTokens.findFirst({
      where: (table, { eq }) => eq(table.id, token),
    });
    if (item) {
      await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.id, item.id));
    }
    return item;
  });

  if (!dbToken) return { error: "Invalid password reset link." };

  if (!isWithinExpirationDate(dbToken.expiresAt)) return { error: "Password reset link expired." };

  await invalidateAllUserSessions(dbToken.userId);
  const hashedPassword = await hashPassword(password);
  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, dbToken.userId);
  setSessionCookie(sessionToken, session.expiresAt);

  await db.update(users).set({ 
    hashedPassword,
  }).where(eq(users.id, dbToken.userId));
  
  redirect(Paths.Dashboard);
}

export const updateAccount = async (_: any, formData: FormData): Promise<ActionResponse<updateAccountInput> & { success?: boolean; error?: string }> => {
  const { user } = await validateRequest();

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
  // const newEmail = (userData?.hashedPassword ? email : userData?.email)

  // Force reverify after updating email
  try {
    await db.update(users).set({ 
      name,
      // email: newEmail,
      // emailVerified: userData?.hashedPassword && email !== user.email ? false : userData?.emailVerified
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
  const { user } = await validateRequest();

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

  const userData = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, user.id),
  });

  if (!userData || !userData?.hashedPassword) {
    return {
      formError: "Internal server error",
    };
  }

  const validPassword = await verifyPassword(userData.hashedPassword, current_password);

  if (!validPassword) {
    return {
      error: "The current password you entered is invalid",
    };
  }

  // Force reverify after updating email
  try {
    const newHashedPassword = await hashPassword(new_password);

    await db.update(users).set({ 
      hashedPassword: newHashedPassword
    }).where(eq(users.id, user.id));

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "Failed to update user information" };
  }
}

export const updateTwoFactorAuth = async (_: any, formData: FormData): Promise<ActionResponse<updatePasswordInput> & { success?: boolean; error?: string }> => {
  const { user } = await validateRequest();

  if (!user) {
    return redirect(Paths.Login);
  }

  // revalidatePath(Paths.Security)
  // redirect(Paths.Security);
  return { success: true };
}

const timeFromNow = (time: Date) => {
  const now = new Date();
  const diff = time.getTime() - now.getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  const seconds = Math.floor(diff / 1000) % 60;
  return `${minutes}m ${seconds}s`;
};

const generateEmailVerificationCode = async (userId: string, email: string): Promise<string> => {
  await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, userId));

  const code = generateRandomString(6, alphabet("0-9")); // 8 digit code

  await db.insert(emailVerificationCodes).values({
    userId,
    email,
    code,
    expiresAt: createDate(new TimeSpan(30, "m")), // 10 minutes
  });

  return code;
}

export const resendMagicLink = async (
  _: any,
  formData: FormData,
): Promise<{ success?: boolean; error?: string;}> => {
  const email = formData.get("email");
  const parsed = z.string().trim().email().safeParse(email);

  if (!parsed.success) {
    return { 
      error: "Please enter a valid email address." 
    };
  }

  const user = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.email, parsed.data),
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
  
    const magicLinkToken = await generateMagicLinkToken(user.id);
    const magicLink = `${env.NEXT_PUBLIC_APP_URL}${Paths.MagicLink}/${magicLinkToken}`;

    await sendEmail(user.email, EmailTemplate.MagicLink, { name: user.name, url: magicLink });

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

  const user = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.email, email),
  });

  if (user) {
    // TODO: We are ratelimiting this in the middleware so this is not needed
    const lastSent = await db.query.magicLinkTokens.findFirst({
      where: (table, { eq }) => eq(table.userId, user?.id),
      columns: { expiresAt: true },
    });
  
    if (lastSent && isWithinExpirationDate(lastSent.expiresAt)) {
      return {
        error: `Please wait ${timeFromNow(lastSent.expiresAt)} before resending a magic link.`,
      };
    }
  
    const magicLinkToken = await generateMagicLinkToken(user.id);
    const magicLink = `${env.NEXT_PUBLIC_APP_URL}${Paths.MagicLink}/${magicLinkToken}`;

    await sendEmail(user.email, EmailTemplate.MagicLink, { name: user.name, url: magicLink });

    return redirect(`${Paths.MagicLink}?email=${encodeURIComponent(user.email)}`);
  } else {
    // Register new user
    
    const userId = nanoid();

    const newContact = await createContact(email, {
      userId: userId,
      name: email // todo: if user updates their name later on in the settings then update contact info
    });

    const magicLinkToken = await generateMagicLinkToken(userId);
    const magicLink = `${env.NEXT_PUBLIC_APP_URL}${Paths.MagicLink}/${magicLinkToken}`;

    await sendEmail(email, EmailTemplate.MagicLink, { name: email, url: magicLink });

    await newAccountTasks(email, email, newContact.contactId);
  
    await db.insert(users).values({
      id: userId,
      name: email,
      email: email,
      emailVerified: true,
      ipAddress: getClientIP(),
      role: "default",
      contactId: newContact.contactId ?? null
    });
  
    return redirect(`${Paths.MagicLink}?email=${encodeURIComponent(email)}`);
  }
}

const generateMagicLinkToken = async (userId: string) => {
  await db.delete(magicLinkTokens).where(eq(magicLinkTokens.userId, userId));

  const code = generateRandomString(64, alphabet("a-z", "A-Z", "0-9"));

  await db.insert(magicLinkTokens).values({
    id: code,
    userId,
    expiresAt: createDate(new TimeSpan(5, "m")), // 5 minutes
  });

  return code;
}

export const validateMagicLinkToken = async (token: string) => {
  const dbToken = await db.transaction(async (tx) => {
    const item = await tx.query.magicLinkTokens.findFirst({
      where: (table, { eq }) => eq(table.id, token),
    });
    if (item) {
      await tx.delete(magicLinkTokens).where(eq(magicLinkTokens.id, item.id));
    }
    return item;
  });

  // if (!dbToken) return { error: "Invalid magic link." };

  if (!dbToken) {
    cookies().set("auth_error", "Invalid magic link", { maxAge: 5, path: "/" });
    return redirect(Paths.Login);
  };

  // if (!isWithinExpirationDate(dbToken.expiresAt)) return { error: "Magic link link expired." };

  if (!isWithinExpirationDate(dbToken.expiresAt)) {
    cookies().set("auth_error", "Magic link link expired", { maxAge: 5, path: "/" });
    return redirect(Paths.Login);
  }
  
  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, dbToken.userId);
  setSessionCookie(sessionToken, session.expiresAt);

  await db.update(users).set({ ipAddress: getClientIP() }).where(eq(users.id, dbToken.userId));
  // await db.update(users).set({ emailVerified: true }).where(eq(users.id, dbToken.userId));

  redirect(Paths.Dashboard);
}

const generatePasswordResetToken = async (userId: string): Promise<string> => {
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  const tokenId = nanoid(48);
  await db.insert(passwordResetTokens).values({
    id: tokenId,
    userId,
    expiresAt: createDate(new TimeSpan(10, "m")),
  });
  return tokenId;
}

// Update the hashPassword function
const hashPassword = async (password: string): Promise<string> => {
  // Argon2id with minimum recommended settings
  return hash(password, {
    algorithm: 2, // Argon2id
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    parallelism: 1,
  });
};

// Update the verifyPassword function
const verifyPassword = async (storedHash: string, password: string): Promise<boolean> => {
  return verify(storedHash, password);
};