export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8 border-b border-hairline pb-4">
      <h1 className="font-serif text-2xl text-ink">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-ink/60">{description}</p>
      )}
    </div>
  );
}
