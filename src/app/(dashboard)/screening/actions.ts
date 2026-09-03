"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireLandlordId } from "@/lib/session";

const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETE"] as const;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min: number, max: number, decimals: number): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

export async function requestScreening(formData: FormData) {
  const landlordId = await requireLandlordId();

  const propertyId = formData.get("propertyId");
  const applicantName = formData.get("applicantName");
  const applicantEmail = formData.get("applicantEmail");

  if (typeof propertyId !== "string" || !propertyId) return;
  if (typeof applicantName !== "string" || !applicantName.trim()) return;
  if (typeof applicantEmail !== "string" || !applicantEmail.trim()) return;

  const property = await prisma.property.findFirst({
    where: { id: propertyId, landlordId },
  });
  if (!property) return;

  // Mock screening result — real TransUnion SmartMove integration comes later.
  const status = STATUSES[randomInt(0, STATUSES.length - 1)];
  const creditScore = randomInt(560, 820);
  const incomeMultiplier = randomDecimal(1.5, 4.5, 2);

  let recommendation: "APPROVE" | "CAUTION" | "DECLINE" | null = null;
  if (status === "COMPLETE") {
    if (creditScore >= 700 && incomeMultiplier >= 2.5) {
      recommendation = "APPROVE";
    } else if (creditScore < 620 || incomeMultiplier < 2) {
      recommendation = "DECLINE";
    } else {
      recommendation = "CAUTION";
    }
  }

  await prisma.screeningApplication.create({
    data: {
      propertyId,
      applicantName: applicantName.trim(),
      applicantEmail: applicantEmail.trim(),
      status,
      creditScore: status === "PENDING" ? null : creditScore,
      incomeMultiplier: status === "PENDING" ? null : incomeMultiplier,
      recommendation,
    },
  });

  revalidatePath("/screening");
}
