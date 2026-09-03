import { PageHeader } from "@/components/page-header";
import { Disclosure } from "@/components/disclosure";
import { FormField, fieldInputClass } from "@/components/form-field";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireLandlordId } from "@/lib/session";
import { createMaintenanceRequest, toggleResolved } from "./actions";

const PRIORITY_STYLES: Record<string, string> = {
  URGENT: "text-rust",
  STANDARD: "text-ink/70",
  LOW: "text-ink/50",
};

const PRIORITY_LABEL: Record<string, string> = {
  URGENT: "Urgent",
  STANDARD: "Standard",
  LOW: "Low",
};

export default async function MaintenancePage() {
  const landlordId = await requireLandlordId();

  const [properties, requests] = await Promise.all([
    prisma.property.findMany({
      where: { landlordId },
      orderBy: { address: "asc" },
      select: { id: true, address: true },
    }),
    prisma.maintenanceRequest.findMany({
      where: { property: { landlordId } },
      include: { property: true },
      orderBy: [{ resolved: "asc" }, { filedDate: "desc" }],
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Open and resolved maintenance requests."
      />

      <Disclosure label="+ New request">
        {properties.length === 0 ? (
          <p className="text-sm text-ink/50">
            Add a property first from the Properties tab.
          </p>
        ) : (
          <form
            action={createMaintenanceRequest}
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
            <div className="sm:col-span-2">
              <FormField label="Issue description" htmlFor="description">
                <input
                  id="description"
                  name="description"
                  type="text"
                  required
                  className={fieldInputClass}
                />
              </FormField>
            </div>
            <FormField label="Priority" htmlFor="priority">
              <select
                id="priority"
                name="priority"
                defaultValue="STANDARD"
                className={fieldInputClass}
              >
                <option value="LOW">Low</option>
                <option value="STANDARD">Standard</option>
                <option value="URGENT">Urgent</option>
              </select>
            </FormField>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="bg-moss px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink"
              >
                File request
              </button>
            </div>
          </form>
        )}
      </Disclosure>

      {requests.length === 0 ? (
        <p className="text-sm text-ink/50">No maintenance requests yet.</p>
      ) : (
        <div className="border-t border-hairline">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 border-b border-hairline px-2 py-2 text-xs font-medium uppercase tracking-wide text-ink/50">
            <span>Property</span>
            <span>Issue</span>
            <span>Priority</span>
            <span>Filed</span>
            <span>Status</span>
          </div>
          {requests.map((request) => (
            <div
              key={request.id}
              className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center gap-4 border-b border-hairline px-2 py-3 text-sm"
            >
              <span className="text-ink">{request.property.address}</span>
              <span className="text-ink/70">{request.description}</span>
              <span
                className={`text-xs font-medium ${
                  PRIORITY_STYLES[request.priority] ?? "text-ink/70"
                }`}
              >
                {PRIORITY_LABEL[request.priority] ?? request.priority}
              </span>
              <span className="text-ink/70">
                {formatDate(request.filedDate)}
              </span>
              <form action={toggleResolved}>
                <input type="hidden" name="requestId" value={request.id} />
                <input
                  type="hidden"
                  name="currentlyResolved"
                  value={String(request.resolved)}
                />
                <button
                  type="submit"
                  className={`text-xs font-medium hover:underline ${
                    request.resolved ? "text-ink/50" : "text-moss"
                  }`}
                >
                  {request.resolved ? "Resolved" : "Mark resolved"}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
