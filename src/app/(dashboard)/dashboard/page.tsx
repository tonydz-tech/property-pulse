import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireLandlordId } from "@/lib/session";
import { startOfMonth, startOfNextMonth } from "@/lib/date";
import { ensureCurrentRentPayments } from "../rent-ledger/actions";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-hairline px-2 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
        {label}
      </p>
      <p className="mt-1 font-serif text-3xl text-ink">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const landlordId = await requireLandlordId();
  await ensureCurrentRentPayments(landlordId);

  const from = startOfMonth();
  const to = startOfNextMonth();

  const [properties, payments, maintenanceRequests] = await Promise.all([
    prisma.property.findMany({
      where: { landlordId },
      select: { id: true, status: true },
    }),
    prisma.rentPayment.findMany({
      where: { property: { landlordId }, dueDate: { gte: from, lt: to } },
      include: { property: true },
    }),
    prisma.maintenanceRequest.findMany({
      where: { property: { landlordId }, resolved: false },
      include: { property: true },
      orderBy: { filedDate: "desc" },
    }),
  ]);

  const occupiedCount = properties.filter(
    (p) => p.status === "OCCUPIED"
  ).length;
  const rentCollected = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const latePayments = payments.filter((p) => p.status === "LATE");
  const urgentMaintenance = maintenanceRequests.filter(
    (r) => r.priority === "URGENT"
  );

  const needsAttention = [
    ...urgentMaintenance.map((r) => ({
      key: `maintenance-${r.id}`,
      href: "/maintenance",
      address: r.property.address,
      label: r.description,
      tag: "Urgent maintenance",
      date: r.filedDate,
    })),
    ...latePayments.map((p) => ({
      key: `rent-${p.id}`,
      href: "/rent-ledger",
      address: p.property.address,
      label: `${formatCurrency(p.amount.toString())} rent`,
      tag: "Late rent",
      date: p.dueDate,
    })),
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Occupancy, rent collected, and what needs attention."
      />

      <div className="grid grid-cols-2 gap-x-8 border-b border-hairline sm:grid-cols-4">
        <StatTile
          label="Occupancy"
          value={`${occupiedCount}/${properties.length}`}
        />
        <StatTile
          label="Rent collected"
          value={formatCurrency(rentCollected)}
        />
        <StatTile label="Late payments" value={String(latePayments.length)} />
        <StatTile
          label="Open maintenance"
          value={String(maintenanceRequests.length)}
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-serif text-xl text-ink">Needs attention</h2>
        {needsAttention.length === 0 ? (
          <p className="text-sm text-ink/50">
            Nothing urgent — everything is on track.
          </p>
        ) : (
          <div className="border-t border-hairline">
            {needsAttention.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="grid grid-cols-[1fr_1.5fr_1fr_1fr] items-center gap-4 border-b border-hairline px-2 py-3 text-sm transition hover:bg-white/40"
              >
                <span className="text-xs font-medium text-rust">
                  {item.tag}
                </span>
                <span className="text-ink">{item.address}</span>
                <span className="text-ink/70">{item.label}</span>
                <span className="text-ink/50">{formatDate(item.date)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
