ALTER TABLE "transactions" RENAME COLUMN "amount" TO "balance";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "balance" SET DATA TYPE double precision;