"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireLandlordId } from "@/lib/session";
import { startOfMonth, startOfNextMonth } from "@/lib/date";
import { stripe } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/url";

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

export async function connectStripeAccount() {
  const landlordId = await requireLandlordId();
  const baseUrl = await getBaseUrl();

  const landlord = await prisma.landlord.findUniqueOrThrow({
    where: { id: landlordId },
  });

  let accountId = landlord.stripeAccountId;
  if (!accountId) {
    const account = await stripe.v2.core.accounts.create({
      contact_email: landlord.email,
      display_name: landlord.name,
      dashboard: "express",
      identity: {
        country: "us",
        entity_type: "individual",
      },
      configuration: {
        merchant: {
          capabilities: {
            card_payments: { requested: true },
          },
        },
        recipient: {
          capabilities: {
            stripe_balance: {
              stripe_transfers: { requested: true },
            },
          },
        },
      },
      defaults: {
        currency: "usd",
        responsibilities: {
          fees_collector: "stripe",
          losses_collector: "stripe",
        },
      },
    }, {
      apiVersion: "2026-08-26.preview",
    });
    accountId = account.id;
    await prisma.landlord.update({
      where: { id: landlordId },
      data: { stripeAccountId: accountId },
    });
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/rent-ledger`,
    return_url: `${baseUrl}/api/stripe/connect/return`,
    type: "account_onboarding",
  });

  redirect(accountLink.url);
}

export async function createPaymentLink(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const landlordId = await requireLandlordId();

  const paymentId = formData.get("paymentId");
  if (typeof paymentId !== "string" || !paymentId) return undefined;

  const landlord = await prisma.landlord.findUniqueOrThrow({
    where: { id: landlordId },
  });
  if (!landlord.stripeAccountId || !landlord.stripeOnboarded) {
    return undefined;
  }

  const payment = await prisma.rentPayment.findFirst({
    where: { id: paymentId, property: { landlordId } },
    include: { property: true },
  });
  if (!payment) return undefined;

  const baseUrl = await getBaseUrl();

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Rent — ${payment.property.address}` },
          unit_amount: Math.round(Number(payment.amount) * 100),
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      transfer_data: { destination: landlord.stripeAccountId },
    },
    success_url: `${baseUrl}/rent-ledger?paid=1`,
    cancel_url: `${baseUrl}/rent-ledger`,
    metadata: { rentPaymentId: payment.id },
  });

  await prisma.rentPayment.update({
    where: { id: payment.id },
    data: { stripeCheckoutSessionId: checkoutSession.id },
  });

  return checkoutSession.url ?? undefined;
}
