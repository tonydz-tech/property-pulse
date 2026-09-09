import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const rentPaymentId = session.metadata?.rentPaymentId;

    if (rentPaymentId) {
      await prisma.rentPayment.updateMany({
        where: { id: rentPaymentId },
        data: {
          status: "PAID",
          paidDate: new Date(),
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : undefined,
        },
      });
    }
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;

    await prisma.landlord.updateMany({
      where: { stripeAccountId: account.id },
      data: {
        stripeOnboarded: Boolean(
          account.charges_enabled && account.details_submitted
        ),
      },
    });
  }

  return NextResponse.json({ received: true });
}
