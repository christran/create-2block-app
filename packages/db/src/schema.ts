import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  boolean,
  index,
  text,
  timestamp,
  varchar,
  uuid,
  bigint,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    fullname: varchar("fullname", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    ipAddress: varchar("ip_address", { length: 255 }),
    hashedPassword: varchar("hashed_password", { length: 255 }),
    role: varchar("role", { length: 10, enum: ["guest", "default", "member", "premium", "admin"] })
    .default("default")
    .notNull(),
    contactId: varchar("contact_id", { length: 255 }).unique().notNull(),
    googleId: varchar("google_id", { length: 255 }).unique(),
    discordId: varchar("discord_id", { length: 255 }).unique(),
    githubId: varchar("github_id", { length: 255 }).unique(),
    avatar: varchar("avatar"),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 191 }),
    stripePriceId: varchar("stripe_price_id", { length: 191 }),
    stripeCustomerId: varchar("stripe_customer_id", { length: 191 }),
    stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  },
  (t) => ({
    emailIdx: index("user_email_idx").on(t.email),
    contactIdx: index("user_contact_idx").on(t.contactId),
    googleIdx: index("user_google_idx").on(t.googleId),
    discordIdx: index("user_discord_idx").on(t.discordId),
    githubIdx: index("user_githubId_idx").on(t.githubId),
    roleIdx: index("user_role_idx").on(t.role),
    stripeCustomerIdx: index("user_stripe_customer_idx").on(t.stripeCustomerId),
    createdAtIdx: index("user_created_at_idx").on(t.createdAt),
  }),
);

export type User = typeof users.$inferSelect;
export type UserWithoutPassword = Omit<User, "hashedPassword">;
export type NewUser = typeof users.$inferInsert;

export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 21 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => ({
    userIdx: index("session_user_idx").on(t.userId),
  }),
);

export const files = pgTable("files", {
  id: uuid("id").primaryKey(),
  key: varchar("key").notNull(),
  userId: varchar("user_id", { length: 21 }).notNull(),
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  contentType: varchar("content_type", { length: 100 }).notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  s3Provider: varchar("s3_provider", { length: 64, enum: ["cloudflare", "backblaze"] }).default("cloudflare").notNull(), // TODO: remove when backblaze is the only provider
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  uploadCompleted: boolean("upload_completed").default(false),
},
(t) => ({
  userIdx: index("file_user_idx").on(t.userId),
  keyIdx: index("file_key_idx").on(t.key),
  createdAtIdx: index("file_created_at_idx").on(t.createdAt),
}),
);

export type File = typeof files.$inferSelect;

export const emailVerificationCodes = pgTable(
  "email_verification_codes",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 21 }).unique().notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    code: varchar("code", { length: 8 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => ({
    userIdx: index("verification_code_user_idx").on(t.userId),
    emailIdx: index("verification_code_email_idx").on(t.email),
  }),
);

export const magicLinkTokens = pgTable(
  "magic_link_tokens",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 21 }).unique().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => ({
    userIdx: index("magic_Link_token_user_idx").on(t.userId),
  }),
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    userId: varchar("user_id", { length: 21 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => ({
    userIdx: index("password_token_user_idx").on(t.userId),
  }),
);

export const posts = pgTable(
  "posts",
  {
    id: varchar("id", { length: 15 }).primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    excerpt: varchar("excerpt", { length: 255 }).notNull(),
    content: text("content").notNull(),
    status: varchar("status", { length: 10, enum: ["draft", "published"] })
      .default("draft")
      .notNull(),
    tags: varchar("tags", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  },
  (t) => ({
    userIdx: index("post_user_idx").on(t.userId),
    createdAtIdx: index("post_created_at_idx").on(t.createdAt),
    statusIdx: index("post_status_idx").on(t.status),
    tagsIdx: index("post_tags_idx").on(t.tags),
  }),
);

export const postRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
