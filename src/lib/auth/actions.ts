"use server";

/* eslint @typescript-eslint/no-explicit-any:0, @typescript-eslint/prefer-optional-chain:0 */

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { generateId, Scrypt } from "lucia";
import { isWithinExpirationDate, TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
// import { Argon2id } from "oslo/password";
import { eq } from "drizzle-orm";
import { lucia } from "@/lib/auth";
import { db } from "@/server/db";
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
} from "@/lib/validators/auth";
import { emailVerificationCodes, passwordResetTokens, users } from "@/server/db/schema";
// import { sendEmail, EmailTemplate } from "@/lib/email";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "../constants";
import { env } from "@/env";
import { sendEmail, EmailTemplate } from "../email/resend";
import { DatabaseUserAttributes } from "@/lib/auth";

export interface ActionResponse<T> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
}

export async function login(_: any, formData: FormData): Promise<ActionResponse<LoginInput>> {
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
	const validPassword = await new Scrypt().verify(existingUser.hashedPassword!, password);

  if (!validPassword) {
    return {
      formError: "Incorrect email or password",
    };
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return redirect(Paths.Dashboard);
}

export async function signup(_: any, formData: FormData): Promise<ActionResponse<SignupInput>> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = signupSchema.safeParse(obj);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        fullname: err.fieldErrors.fullname?.[0],
        email: err.fieldErrors.email?.[0],
        password: err.fieldErrors.password?.[0],
      },
    };
  }

  const { fullname, email, password } = parsed.data;

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
  const hashedPassword = await new Scrypt().hash(password);
  
  await db.insert(users).values({
    id: userId,
    fullname,
    email,
    hashedPassword,
    // avatar,
  });

  const verificationCode = await generateEmailVerificationCode(userId, email);

  await sendEmail(email, EmailTemplate.EmailVerification, { fullname, code: verificationCode });

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  // Redirect to /verify-email or to dashboard
  return redirect(Paths.Dashboard);
}

export async function logout(): Promise<{ error: string } | void> {
  const { session } = await validateRequest();
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

export async function resendVerificationEmail(): Promise<{
  error?: string;
  success?: boolean;
}> {
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

  const verificationCode = await generateEmailVerificationCode(user.id, user.email);
  await sendEmail(user.email, EmailTemplate.EmailVerification, { fullname: user.fullname, code: verificationCode });

  return { success: true };
}

export async function verifyEmail(_: any, formData: FormData): Promise<{ error: string } | void> {
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

  await lucia.invalidateUserSessions(user.id);
  await db.update(users).set({ emailVerified: true }).where(eq(users.id, user.id));
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  redirect(Paths.Dashboard);
}

// Rate limit this
export async function sendPasswordResetLink(
  _: any,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
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

      await sendEmail(user.email, EmailTemplate.PasswordReset, { fullname: user.fullname, url: verificationLink });

      return { success: true };
    } catch (error) {
      return { success: false, error: "Unable to send password reset email." };
    }
  } else {
    return { success: true };
  }
}

// Rate limit this
export async function setupNewPasswordLink(): Promise<{
  success?: boolean;
  error?: string;
}> {
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

    await sendEmail(user.email, EmailTemplate.PasswordReset, { fullname: user.fullname, url: verificationLink });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Unable to send new password setup email." };
  }
}

export async function resetPassword(
  _: any,
  formData: FormData,
): Promise<{ success?: boolean; error?: string;}> {
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

  await lucia.invalidateUserSessions(dbToken.userId);
  const hashedPassword = await new Scrypt().hash(password);
  await db.update(users).set({ hashedPassword }).where(eq(users.id, dbToken.userId));
  const session = await lucia.createSession(dbToken.userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  
  redirect(Paths.Dashboard);
}

export async function updateAccount(_: any, formData: FormData): Promise<ActionResponse<updateAccountInput>> {
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
        fullname: err.fieldErrors.fullname?.[0],
        email: err.fieldErrors.email?.[0],
      },
    };
  }

  const { fullname, email } = parsed.data;

  const existingUser = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.email, email),
    columns: { email: true },
  });

  if (existingUser) {
    return {
      error: "The email is already associated with another account.",
    };
  }

  const userData = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.email, user.email),
  });

  // email input disabled on client side, force on server side
  const newEmail = (userData.hashedPassword ? email : userData.email)

  // Force reverify after updating email
  try {
    await db.update(users).set({ 
      fullname,
      email: newEmail,
      emailVerified: userData.hashedPassword && email !== user.email ? false : userData.emailVerified
    }).where(eq(users.id, user.id));

    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { error: 'Failed to update user information' };
  }
}

export async function updatePassword(_: any, formData: FormData): Promise<ActionResponse<updatePasswordInput>> {
  const { user } = await validateRequest();

  if (!user) {
    return redirect(Paths.Login);
  }

  const obj = Object.fromEntries(formData.entries());

  const parsed = updatePasswordSchema.safeParse(obj);

  if (!parsed.success) {
    const err = parsed.error.flatten();
    console.log(err)
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


	const validPassword = await new Scrypt().verify(userData.hashedPassword!, current_password);

  if (!validPassword) {
    return {
      error: "Current password is invalid",
    };
  }

  // Force reverify after updating email
  try {
    const newHashedPassword = await new Scrypt().hash(new_password);

    await db.update(users).set({ 
      hashedPassword: newHashedPassword
    }).where(eq(users.id, user.id));

    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { error: 'Failed to update user information' };
  }
}

export async function getUserById(userId: string): Promise<DatabaseUserAttributes | null> {
  const { user } = await validateRequest();

  if (!user) {
    return redirect(Paths.Login);
  }

  try {
    const foundUser = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table?.id, userId),
    });

    return foundUser || null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

const timeFromNow = (time: Date) => {
  const now = new Date();
  const diff = time.getTime() - now.getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  const seconds = Math.floor(diff / 1000) % 60;
  return `${minutes}m ${seconds}s`;
};

async function generateEmailVerificationCode(userId: string, email: string): Promise<string> {
  await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, userId));
  const code = generateRandomString(6, alphabet("0-9")); // 8 digit code
  await db.insert(emailVerificationCodes).values({
    userId,
    email,
    code,
    expiresAt: createDate(new TimeSpan(10, "m")), // 10 minutes
  });
  return code;
}

async function generatePasswordResetToken(userId: string): Promise<string> {
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  const tokenId = generateId(40);
  await db.insert(passwordResetTokens).values({
    id: tokenId,
    userId,
    expiresAt: createDate(new TimeSpan(10, "m")),
  });
  return tokenId;
}
