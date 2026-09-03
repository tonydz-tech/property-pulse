import { PageHeader } from "@/components/page-header";
import { Disclosure } from "@/components/disclosure";
import { FormField, fieldInputClass } from "@/components/form-field";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireLandlordId } from "@/lib/session";
import { addTenant, createProperty } from "./actions";

export default async function PropertiesPage() {
  const landlordId = await requireLandlordId();

  const properties = await prisma.property.findMany({
    where: { landlordId },
    orderBy: { createdAt: "desc" },
    include: {
      tenants: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div>
      <PageHeader
        title="Properties"
        description="Every property you manage, with tenant, rent, and lease status."
      />

      <Disclosure label="+ Add property">
        <form action={createProperty} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField label="Address" htmlFor="address">
              <input
                id="address"
                name="address"
                type="text"
                required
                className={fieldInputClass}
              />
            </FormField>
          </div>
          <FormField label="Monthly rent" htmlFor="monthlyRent">
            <input
              id="monthlyRent"
              name="monthlyRent"
              type="number"
              min="0"
              step="1"
              required
              className={fieldInputClass}
            />
          </FormField>
          <FormField label="Lease end date (optional)" htmlFor="leaseEndDate">
            <input
              id="leaseEndDate"
              name="leaseEndDate"
              type="date"
              className={fieldInputClass}
            />
          </FormField>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="bg-moss px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink"
            >
              Add property
            </button>
          </div>
        </form>
      </Disclosure>

      {properties.length === 0 ? (
        <p className="text-sm text-ink/50">
          No properties yet. Add your first one above.
        </p>
      ) : (
        <div className="border-t border-hairline">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 border-b border-hairline px-2 py-2 text-xs font-medium uppercase tracking-wide text-ink/50">
            <span>Address</span>
            <span>Tenant</span>
            <span>Rent</span>
            <span>Status</span>
            <span>Lease End</span>
          </div>
          {properties.map((property) => {
            const tenant = property.tenants[0];
            return (
              <div
                key={property.id}
                className="border-b border-hairline px-2 py-3"
              >
                <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] items-center gap-4 text-sm">
                  <span className="text-ink">{property.address}</span>
                  <span className="text-ink/70">
                    {tenant ? tenant.name : "—"}
                  </span>
                  <span className="text-ink/70">
                    {formatCurrency(property.monthlyRent.toString())}
                  </span>
                  <span>
                    <span
                      className={`text-xs ${
                        property.status === "OCCUPIED"
                          ? "text-moss"
                          : "text-ink/50"
                      }`}
                    >
                      {property.status === "OCCUPIED" ? "Occupied" : "Vacant"}
                    </span>
                  </span>
                  <span className="text-ink/70">
                    {formatDate(property.leaseEndDate)}
                  </span>
                </div>

                {property.status === "VACANT" && (
                  <div className="mt-3">
                    <Disclosure label="+ Add tenant">
                      <form
                        action={addTenant}
                        className="grid gap-4 sm:grid-cols-2"
                      >
                        <input
                          type="hidden"
                          name="propertyId"
                          value={property.id}
                        />
                        <FormField label="Tenant name" htmlFor={`name-${property.id}`}>
                          <input
                            id={`name-${property.id}`}
                            name="name"
                            type="text"
                            required
                            className={fieldInputClass}
                          />
                        </FormField>
                        <FormField label="Tenant email" htmlFor={`email-${property.id}`}>
                          <input
                            id={`email-${property.id}`}
                            name="email"
                            type="email"
                            required
                            className={fieldInputClass}
                          />
                        </FormField>
                        <FormField
                          label="Lease start"
                          htmlFor={`leaseStart-${property.id}`}
                        >
                          <input
                            id={`leaseStart-${property.id}`}
                            name="leaseStart"
                            type="date"
                            required
                            className={fieldInputClass}
                          />
                        </FormField>
                        <FormField
                          label="Lease end (optional)"
                          htmlFor={`leaseEnd-${property.id}`}
                        >
                          <input
                            id={`leaseEnd-${property.id}`}
                            name="leaseEnd"
                            type="date"
                            className={fieldInputClass}
                          />
                        </FormField>
                        <div className="sm:col-span-2">
                          <button
                            type="submit"
                            className="bg-moss px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink"
                          >
                            Add tenant
                          </button>
                        </div>
                      </form>
                    </Disclosure>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
