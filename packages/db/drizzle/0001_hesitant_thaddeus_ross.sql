CREATE INDEX IF NOT EXISTS "file_user_idx" ON "files" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "file_key_idx" ON "files" USING btree ("key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "file_created_at_idx" ON "files" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_status_idx" ON "posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_tags_idx" ON "posts" USING btree ("tags");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_stripe_customer_idx" ON "users" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_created_at_idx" ON "users" USING btree ("created_at");