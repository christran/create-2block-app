CREATE TABLE IF NOT EXISTS "2block_magic_link_tokens" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "2block_magic_link_tokens_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "2block_users" ADD COLUMN "contact_id" varchar(255) NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "magic_Link_token_user_idx" ON "2block_magic_link_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_contact_idx" ON "2block_users" USING btree ("contact_id");--> statement-breakpoint
ALTER TABLE "2block_users" ADD CONSTRAINT "2block_users_contact_id_unique" UNIQUE("contact_id");