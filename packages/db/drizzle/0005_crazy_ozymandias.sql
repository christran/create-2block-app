ALTER TABLE "2block_files" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "2block_files" ADD COLUMN "updated_at" timestamp;