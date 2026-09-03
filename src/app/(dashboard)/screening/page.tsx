import { PageHeader } from "@/components/page-header";
import { Disclosure } from "@/components/disclosure";
import { FormField, fieldInputClass } from "@/components/form-field";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireLandlordId } from "@/lib/session";
import { requestScreening } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETE: "Complete",
};

const RECOMMENDATION_STYLES: Record<string, string> = {
  APPROVE: "text-moss",
  CAUTION: "text-ochre",
  DECLINE: "text-rust",
};

const RECOMMENDATION_LABEL: Record<string, string> = {
  APPROVE: "Approve",
  CAUTION: "Caution",
  DECLINE: "Decline",
};

export default async function ScreeningPage() {
  const landlordId = await requireLandlordId();

  const [properties, applications] = await Promise.all([
    prisma.property.findMany({
      where: { landlordId },
      orderBy: { address: "asc" },
      select: { id: true, address: true },
    }),
    prisma.screeningApplication.findMany({
      where: { property: { landlordId } },
      include: { property: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Tenant Screening"
        description="Applicants and screening requests."
      />

      <Disclosure label="+ Request screening">
        {properties.length === 0 ? (
          <p className="text-sm text-ink/50">
            Add a property first from the Properties tab.
          </p>
        ) : (
          <form
            action={requestScreening}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <FormField label="Property" htmlFor="propertyId">
                <select
                  id="propertyId"
                  name="propertyId"
                  required
                  className={fieldInputClass}
                >
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.address}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="Applicant name" htmlFor="applicantName">
              <input
                id="applicantName"
                name="applicantName"
                type="text"
                required
                className={fieldInputClass}
              />
            </FormField>
            <FormField label="Applicant email" htmlFor="applicantEmail">
              <input
                id="applicantEmail"
                name="applicantEmail"
                type="email"
                required
                className={fieldInputClass}
              />
            </FormField>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="bg-moss px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink"
              >
                Request screening
              </button>
            </div>
          </form>
        )}
      </Disclosure>

      {applications.length === 0 ? (
        <p className="text-sm text-ink/50">No screening applications yet.</p>
      ) : (
        <div className="border-t border-hairline">
          <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 border-b border-hairline px-2 py-2 text-xs font-medium uppercase tracking-wide text-ink/50">
            <span>Applicant</span>
            <span>Property</span>
            <span>Status</span>
            <span>Credit</span>
            <span>Income x Rent</span>
            <span>Recommendation</span>
          </div>
          {applications.map((application) => (
            <div
              key={application.id}
              className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr] items-center gap-4 border-b border-hairline px-2 py-3 text-sm"
            >
              <span className="text-ink">
                {application.applicantName}
                <span className="block text-xs text-ink/50">
                  {formatDate(application.createdAt)}
                </span>
              </span>
              <span className="text-ink/70">
                {application.property.address}
              </span>
              <span className="text-ink/70">
                {STATUS_LABEL[application.status] ?? application.status}
              </span>
              <span className="text-ink/70">
                {application.creditScore ?? "—"}
              </span>
              <span className="text-ink/70">
                {application.incomeMultiplier
                  ? `${application.incomeMultiplier}x`
                  : "—"}
              </span>
              <span
                className={`text-xs font-medium ${
                  application.recommendation
                    ? (RECOMMENDATION_STYLES[application.recommendation] ??
                      "text-ink/70")
                    : "text-ink/40"
                }`}
              >
                {application.recommendation
                  ? RECOMMENDATION_LABEL[application.recommendation]
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
