import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireLandlordId } from "@/lib/session";
import { startOfMonth, startOfNextMonth } from "@/lib/date";
import { ensureCurrentRentPayments, toggleRentStatus } from "./actions";

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

  const payments = await prisma.rentPayment.findMany({
    where: {
      property: { landlordId },
      dueDate: { gte: from, lt: to },
    },
    include: { property: true },
    orderBy: { property: { address: "asc" } },
  });

  return (
    <div>
      <PageHeader
        title="Rent Ledger"
        description="Rent amounts and paid/late status by property, this month."
      />

      {payments.length === 0 ? (
        <p className="text-sm text-ink/50">
          No properties yet. Add one from the Properties tab first.
        </p>
      ) : (
        <div className="border-t border-hairline">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-hairline px-2 py-2 text-xs font-medium uppercase tracking-wide text-ink/50">
            <span>Property</span>
            <span>Rent</span>
            <span>Due</span>
            <span>Status</span>
          </div>
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 border-b border-hairline px-2 py-3 text-sm"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
