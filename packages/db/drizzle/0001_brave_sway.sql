CREATE TABLE IF NOT EXISTS "2block_files" (
	"id" uuid PRIMARY KEY NOT NULL,
	"original_filename" varchar(255) NOT NULL,
	"unique_filename" varchar(255) NOT NULL,
	"presigned_url" text NOT NULL,
	"content_type" varchar(100) NOT NULL
);
