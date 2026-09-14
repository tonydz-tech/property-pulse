import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Property Pulse — Property management for landlords",
  description:
    "Track rent, screen tenants, manage maintenance, and collect rent online — built for landlords managing 6–20 rental properties.",
};

const FEATURES = [
  {
    number: "01",
    title: "Dashboard",
    description:
      "Occupancy, rent collected, late payments, and open maintenance — everything that needs attention, in one view.",
  },
  {
    number: "02",
    title: "Properties",
    description:
      "Every unit you manage, with tenant, rent, status, and lease end date at a glance.",
  },
  {
    number: "03",
    title: "Tenant Screening",
    description:
      "Request a screening for an applicant and get a credit score, income multiplier, and recommendation back.",
  },
  {
    number: "04",
    title: "Maintenance",
    description:
      "Log requests as they come in, flag what's urgent, and mark them resolved once handled.",
  },
  {
    number: "05",
    title: "Rent Ledger",
    description:
      "See who's paid and who's late, and collect rent online with a payment link — funds go straight to your bank account.",
  },
];

export default function Home() {
  return (
    <div>
      <header className="flex items-center justify-between border-b border-hairline px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6 shrink-0 text-ink" />
          <span className="whitespace-nowrap font-serif text-base text-ink sm:text-lg">
            Property Pulse
          </span>
        </div>
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/login"
            className="whitespace-nowrap text-sm font-medium text-ink/70 hover:text-ink"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="whitespace-nowrap bg-moss px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-ink sm:px-4 sm:py-2"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="bg-ink px-6 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-4xl leading-tight text-paper sm:text-5xl">
            Run your rentals like a business, not a stack of spreadsheets.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-paper/70">
            Property Pulse is built for landlords managing 6–20 rental
            properties — rent tracking, tenant screening, maintenance, and
            online rent collection in one place.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-ochre px-6 py-3 text-sm font-medium text-ink transition hover:brightness-110"
            >
              Create your account
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 text-sm font-medium text-paper/80 hover:text-paper"
            >
              Sign in →
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-8 border-t border-white/10 pt-10 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-paper/50">
              Occupancy
            </p>
            <p className="mt-1 font-serif text-3xl text-paper">11/12</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-paper/50">
              Rent collected
            </p>
            <p className="mt-1 font-serif text-3xl text-paper">$19,800</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-paper/50">
              Late payments
            </p>
            <p className="mt-1 font-serif text-3xl text-rust">1</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-paper/50">
              Open maintenance
            </p>
            <p className="mt-1 font-serif text-3xl text-paper">3</p>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-2xl text-ink">
            Five screens. Everything you need.
          </h2>
          <div className="mt-8 border-t border-hairline">
            {FEATURES.map((feature) => (
              <div
                key={feature.number}
                className="flex gap-6 border-b border-hairline py-6"
              >
                <span className="font-serif text-lg text-ochre">
                  {feature.number}
                </span>
                <div>
                  <h3 className="font-serif text-xl text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-ink/60">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-moss/10 px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-2xl text-ink">
            Get paid without chasing checks
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink/60">
            Connect a Stripe account and send tenants a payment link. They pay
            by card, and funds land directly in your bank account — no more
            tracking down paper checks or Venmo requests.
          </p>
        </div>
      </section>

      <section className="bg-ink px-6 py-16 sm:px-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <h2 className="font-serif text-2xl text-paper">
            Ready to get organized?
          </h2>
          <Link
            href="/signup"
            className="bg-ochre px-6 py-3 text-sm font-medium text-ink transition hover:brightness-110"
          >
            Create your account
          </Link>
        </div>
      </section>

      <footer className="flex items-center justify-between border-t border-hairline px-6 py-6 text-sm text-ink/50 sm:px-10">
        <span>© {new Date().getFullYear()} Property Pulse</span>
        <div className="flex gap-6">
          <Link href="/login" className="hover:text-ink">
            Sign in
          </Link>
          <Link href="/signup" className="hover:text-ink">
            Create account
          </Link>
        </div>
      </footer>
    </div>
  );
}
