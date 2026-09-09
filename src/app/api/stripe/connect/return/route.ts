import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const landlord = await prisma.landlord.findUnique({
    where: { id: session.user.id },
  });

  if (landlord?.stripeAccountId) {
    const account = await stripe.accounts.retrieve(landlord.stripeAccountId);
    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        stripeOnboarded: Boolean(
          account.charges_enabled && account.details_submitted
        ),
      },
    });
  }

  return NextResponse.redirect(new URL("/rent-ledger", req.url));
}
