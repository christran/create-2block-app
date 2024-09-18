ALTER TABLE "2block_files" ALTER COLUMN "file_size" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "2block_files" ADD COLUMN "key" varchar(255) NOT NULL;