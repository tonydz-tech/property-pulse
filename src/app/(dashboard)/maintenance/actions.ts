"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireLandlordId } from "@/lib/session";

export async function createMaintenanceRequest(formData: FormData) {
  const landlordId = await requireLandlordId();

  const propertyId = formData.get("propertyId");
  const description = formData.get("description");
  const priority = formData.get("priority");

  if (typeof propertyId !== "string" || !propertyId) return;
  if (typeof description !== "string" || !description.trim()) return;
  if (
    typeof priority !== "string" ||
    !["LOW", "STANDARD", "URGENT"].includes(priority)
  )
    return;

  const property = await prisma.property.findFirst({
    where: { id: propertyId, landlordId },
  });
  if (!property) return;

  await prisma.maintenanceRequest.create({
    data: {
      propertyId,
      description: description.trim(),
      priority: priority as "LOW" | "STANDARD" | "URGENT",
    },
  });

  revalidatePath("/maintenance");
  revalidatePath("/dashboard");
}

export async function toggleResolved(formData: FormData) {
  const landlordId = await requireLandlordId();

  const requestId = formData.get("requestId");
  const currentlyResolved = formData.get("currentlyResolved") === "true";
  if (typeof requestId !== "string" || !requestId) return;

  await prisma.maintenanceRequest.updateMany({
    where: { id: requestId, property: { landlordId } },
    data: { resolved: !currentlyResolved },
  });

  revalidatePath("/maintenance");
  revalidatePath("/dashboard");
}
