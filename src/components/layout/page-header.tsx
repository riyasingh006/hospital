import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-slate-200 bg-white", className)}>
      <div className="container py-6">
        {breadcrumb && <Breadcrumbs items={breadcrumb} />}
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="institutional-heading text-2xl md:text-3xl">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden className="text-slate-300">
                /
              </span>
            )}
            {item.href ? (
              <a
                href={item.href}
                className="hover:text-care-600 hover:underline underline-offset-2"
              >
                {item.label}
              </a>
            ) : (
              <span aria-current="page" className="font-medium text-primary-800">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Institutional section heading used across landing/dashboard pages. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={cn("max-w-2xl", centered && "mx-auto text-center", className)}>
      {centered && (
        <span
          aria-hidden
          className="mx-auto mb-3 block h-1 w-11 rounded-full bg-gradient-to-r from-saffron-500 to-india-600"
        />
      )}
      {eyebrow && (
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-saffron-600">
          {eyebrow}
        </p>
      )}
      <h2 className="institutional-heading text-xl md:text-2xl">
        {!centered && (
          <span className="section-accent mb-3 block" aria-hidden />
        )}
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
      )}
    </div>
  );
}
