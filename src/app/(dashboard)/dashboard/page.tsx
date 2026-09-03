import { PageHeader } from "@/components/page-header";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Occupancy, rent collected, and what needs attention."
      />
      <p className="text-sm text-ink/50">Coming next.</p>
    </div>
  );
}
