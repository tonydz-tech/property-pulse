"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireLandlordId } from "@/lib/session";
import { startOfMonth, startOfNextMonth } from "@/lib/date";

const STATUS_CYCLE = ["PENDING", "PAID", "LATE"] as const;

export async function ensureCurrentRentPayments(landlordId: string) {
  const from = startOfMonth();
  const to = startOfNextMonth();

  const properties = await prisma.property.findMany({
    where: { landlordId },
    select: { id: true, monthlyRent: true },
  });

  const existing = await prisma.rentPayment.findMany({
    where: {
      property: { landlordId },
      dueDate: { gte: from, lt: to },
    },
    select: { propertyId: true },
  });
  const existingPropertyIds = new Set(existing.map((p) => p.propertyId));

  const missing = properties.filter((p) => !existingPropertyIds.has(p.id));
  if (missing.length === 0) return;

  await prisma.rentPayment.createMany({
    data: missing.map((property) => ({
      propertyId: property.id,
      amount: property.monthlyRent,
      dueDate: from,
      status: "PENDING" as const,
    })),
  });
}

export async function toggleRentStatus(formData: FormData) {
  const landlordId = await requireLandlordId();

  const paymentId = formData.get("paymentId");
  const currentStatus = formData.get("currentStatus");
  if (typeof paymentId !== "string" || !paymentId) return;
  if (typeof currentStatus !== "string") return;

  const currentIndex = STATUS_CYCLE.indexOf(
    currentStatus as (typeof STATUS_CYCLE)[number]
  );
  const nextStatus =
    STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length] ?? "PENDING";

  await prisma.rentPayment.updateMany({
    where: { id: paymentId, property: { landlordId } },
    data: {
      status: nextStatus,
      paidDate: nextStatus === "PAID" ? new Date() : null,
    },
  });

  revalidatePath("/rent-ledger");
  revalidatePath("/dashboard");
}
