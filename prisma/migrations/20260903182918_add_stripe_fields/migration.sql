-- AlterTable
ALTER TABLE "landlords" ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeOnboarded" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "rent_payments" ADD COLUMN     "stripeCheckoutSessionId" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT;
