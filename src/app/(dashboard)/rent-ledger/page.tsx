import { PageHeader } from "@/components/page-header";
import { PaymentLinkButton } from "@/components/payment-link-button";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireLandlordId } from "@/lib/session";
import { startOfMonth, startOfNextMonth } from "@/lib/date";
import {
  connectStripeAccount,
  ensureCurrentRentPayments,
  toggleRentStatus,
} from "./actions";

const STATUS_STYLES: Record<string, string> = {
  PAID: "text-moss",
  LATE: "text-rust",
  PENDING: "text-ink/50",
};

const STATUS_LABEL: Record<string, string> = {
  PAID: "Paid",
  LATE: "Late",
  PENDING: "Pending",
};

export default async function RentLedgerPage() {
  const landlordId = await requireLandlordId();
  await ensureCurrentRentPayments(landlordId);

  const from = startOfMonth();
  const to = startOfNextMonth();

  const [landlord, payments] = await Promise.all([
    prisma.landlord.findUniqueOrThrow({
      where: { id: landlordId },
      select: { stripeOnboarded: true },
    }),
    prisma.rentPayment.findMany({
      where: {
        property: { landlordId },
        dueDate: { gte: from, lt: to },
      },
      include: { property: true },
      orderBy: { property: { address: "asc" } },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Rent Ledger"
        description="Rent amounts and paid/late status by property, this month."
      />

      {!landlord.stripeOnboarded && (
        <div className="mb-8 flex items-center justify-between border border-hairline bg-white/40 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-ink">
              Collect rent online with Stripe
            </p>
            <p className="mt-0.5 text-sm text-ink/60">
              Connect a Stripe account to generate payment links tenants can
              pay by card — funds go straight to your bank account.
            </p>
          </div>
          <form action={connectStripeAccount}>
            <button
              type="submit"
              className="whitespace-nowrap bg-moss px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink"
            >
              Connect with Stripe
            </button>
          </form>
        </div>
      )}

      {payments.length === 0 ? (
        <p className="text-sm text-ink/50">
          No properties yet. Add one from the Properties tab first.
        </p>
      ) : (
        <div className="border-t border-hairline">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr] gap-4 border-b border-hairline px-2 py-2 text-xs font-medium uppercase tracking-wide text-ink/50">
            <span>Property</span>
            <span>Rent</span>
            <span>Due</span>
            <span>Status</span>
            <span>Online payment</span>
          </div>
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr] items-center gap-4 border-b border-hairline px-2 py-3 text-sm"
            >
              <span className="text-ink">{payment.property.address}</span>
              <span className="text-ink/70">
                {formatCurrency(payment.amount.toString())}
              </span>
              <span className="text-ink/70">{formatDate(payment.dueDate)}</span>
              <form action={toggleRentStatus}>
                <input type="hidden" name="paymentId" value={payment.id} />
                <input
                  type="hidden"
                  name="currentStatus"
                  value={payment.status}
                />
                <button
                  type="submit"
                  className={`text-xs font-medium hover:underline ${
                    STATUS_STYLES[payment.status] ?? "text-ink/50"
                  }`}
                >
                  {STATUS_LABEL[payment.status] ?? payment.status}
                </button>
              </form>
              <span>
                {landlord.stripeOnboarded && payment.status !== "PAID" ? (
                  <PaymentLinkButton paymentId={payment.id} />
                ) : (
                  <span className="text-xs text-ink/30">—</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
