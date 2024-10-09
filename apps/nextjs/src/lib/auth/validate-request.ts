"use server";

import { cache } from "react";
import { cookies } from "next/headers";
import { validateSessionToken } from "@2block/auth";
import { SessionValidationResult } from "@2block/auth";

// Can't be used in middleware
export const validateRequest = cache(async (): Promise<SessionValidationResult> => {
  const token = cookies().get("session")?.value;

  if (!token) {
    return { session: null, user: null };
  }

  const result = await validateSessionToken(token);

  return result;
})