import { db } from "@2block/db/client";
import { users, sessions } from "@2block/db/schema";
import type { User, Session } from "@2block/db/schema";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { TimeSpan, createDate } from "oslo";
import { eq } from "drizzle-orm";

export const generateSessionToken = (): string => {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);

	return encodeBase32LowerCaseNoPadding(bytes);
};

export const createSession = async (token: string, userId: string): Promise<Session> => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: createDate(new TimeSpan(30, "d"))
	};

	await db.insert(sessions).values(session);
	return session;
}

export const validateSessionToken = async (token: string): Promise<SessionValidationResult> => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = await db
		.select({ user: users, session: sessions })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId));

	if (result.length === 0) {
		return { session: null, user: null };
	}

	const { user, session } = result[0] as { user: User, session: Session };

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, session.id));
		return { session: null, user: null };
	}

	const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
	if (Date.now() >= session.expiresAt.getTime() - fifteenDaysInMs) {
		const newExpiresAt = createDate(new TimeSpan(30, "d"));
		await db
			.update(sessions)
			.set({ expiresAt: newExpiresAt })
			.where(eq(sessions.id, session.id));
		
		session.expiresAt = newExpiresAt;
	}

	return { session, user };
}

export const invalidateSession = async (sessionId: string): Promise<void> => {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export const invalidateAllUserSessions = async (userId: string): Promise<void> => {
	await db.delete(sessions).where(eq(sessions.userId, userId));
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };