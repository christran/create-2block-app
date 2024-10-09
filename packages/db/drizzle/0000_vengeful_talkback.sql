CREATE TABLE IF NOT EXISTS "email_verification_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(8) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "email_verification_codes_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"id" uuid PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"original_filename" varchar(255) NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"file_size" bigint NOT NULL,
	"s3_provider" varchar(64) DEFAULT 'cloudflare' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"upload_completed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "magic_link_tokens" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "magic_link_tokens_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"id" varchar(40) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"excerpt" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" varchar(10) DEFAULT 'draft' NOT NULL,
	"tags" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"hashed_password" varchar(255),
	"role" varchar(10) DEFAULT 'default' NOT NULL,
	"contact_id" varchar(255) NOT NULL,
	"google_id" varchar(255),
	"discord_id" varchar(255),
	"github_id" varchar(255),
	"avatar" varchar,
	"stripe_subscription_id" varchar(191),
	"stripe_price_id" varchar(191),
	"stripe_customer_id" varchar(191),
	"stripe_current_period_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_contact_id_unique" UNIQUE("contact_id"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_discord_id_unique" UNIQUE("discord_id"),
	CONSTRAINT "users_github_id_unique" UNIQUE("github_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_code_user_idx" ON "email_verification_codes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_code_email_idx" ON "email_verification_codes" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "magic_Link_token_user_idx" ON "magic_link_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_token_user_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_user_idx" ON "posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_created_at_idx" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_contact_idx" ON "users" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_google_idx" ON "users" USING btree ("google_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_discord_idx" ON "users" USING btree ("discord_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_githubId_idx" ON "users" USING btree ("github_id");