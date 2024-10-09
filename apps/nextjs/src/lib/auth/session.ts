import { validateSessionToken } from "@2block/auth";
import { SessionValidationResult } from "@2block/auth";
import { cookies } from "next/headers";
import { cache } from "react";
import { env } from "@/env";

export const setSessionCookie = (token: string, expiresAt: Date): void => {
	cookies().set("session", token, {
		httpOnly: true,
		path: "/",
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt
	});
}

export const deleteSessionCookie = (): void => {
	cookies().set("session", "", {
		httpOnly: true,
		path: "/",
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
    maxAge: 0
	});
}