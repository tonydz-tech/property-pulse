"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireLandlordId } from "@/lib/session";

export async function createProperty(formData: FormData) {
  const landlordId = await requireLandlordId();

  const address = formData.get("address");
  const monthlyRent = formData.get("monthlyRent");
  const leaseEndDate = formData.get("leaseEndDate");

  if (typeof address !== "string" || !address.trim()) return;
  if (typeof monthlyRent !== "string" || !monthlyRent) return;

  await prisma.property.create({
    data: {
      landlordId,
      address: address.trim(),
      monthlyRent: Number(monthlyRent),
      leaseEndDate:
        typeof leaseEndDate === "string" && leaseEndDate
          ? new Date(leaseEndDate)
          : null,
    },
  });

  revalidatePath("/properties");
}

export async function addTenant(formData: FormData) {
  const landlordId = await requireLandlordId();

  const propertyId = formData.get("propertyId");
  const name = formData.get("name");
  const email = formData.get("email");
  const leaseStart = formData.get("leaseStart");
  const leaseEnd = formData.get("leaseEnd");

  if (typeof propertyId !== "string" || !propertyId) return;
  if (typeof name !== "string" || !name.trim()) return;
  if (typeof email !== "string" || !email.trim()) return;
  if (typeof leaseStart !== "string" || !leaseStart) return;

  const property = await prisma.property.findFirst({
    where: { id: propertyId, landlordId },
  });
  if (!property) return;

  const leaseEndDate =
    typeof leaseEnd === "string" && leaseEnd ? new Date(leaseEnd) : null;

  await prisma.$transaction([
    prisma.tenant.create({
      data: {
        propertyId,
        name: name.trim(),
        email: email.trim(),
        leaseStart: new Date(leaseStart),
        leaseEnd: leaseEndDate,
      },
    }),
    prisma.property.update({
      where: { id: propertyId },
      data: {
        status: "OCCUPIED",
        leaseEndDate,
      },
    }),
  ]);

  revalidatePath("/properties");
  revalidatePath("/dashboard");
  revalidatePath("/rent-ledger");
}
