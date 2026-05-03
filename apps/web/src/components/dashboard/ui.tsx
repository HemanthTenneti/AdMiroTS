import { cn } from "@/lib/utils";

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--ds-text)]">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-[var(--ds-text-2)]">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--ds-border)] bg-[var(--ds-card)] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.22)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border border-[#7E3AF0] bg-[#7E3AF0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#9F67FF] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export function SecondaryButton({
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border border-[var(--ds-border)] bg-[var(--ds-hover)] px-4 py-2 text-sm font-semibold text-[var(--ds-text-2)] transition hover:bg-[var(--ds-input)] hover:text-[var(--ds-text)] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg border border-[var(--ds-input-border)] bg-[var(--ds-input)] px-3 py-2 text-sm text-[var(--ds-text)] outline-none transition placeholder:text-[var(--ds-text-3)] focus:border-[#7E3AF0] focus:ring-2 focus:ring-[#7E3AF0]/25",
        props.className
      )}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-lg border border-[var(--ds-input-border)] bg-[var(--ds-input)] px-3 py-2 text-sm text-[var(--ds-text)] outline-none transition placeholder:text-[var(--ds-text-3)] focus:border-[#7E3AF0] focus:ring-2 focus:ring-[#7E3AF0]/25",
        props.className
      )}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-lg border border-[var(--ds-input-border)] bg-[var(--ds-card)] px-3 py-2 text-sm text-[var(--ds-text)] outline-none transition focus:border-[#7E3AF0] focus:ring-2 focus:ring-[#7E3AF0]/25",
        props.className
      )}
    />
  );
}

export function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--ds-border)] bg-[var(--ds-card)]">
      <table className="min-w-full divide-y divide-[var(--ds-border)] text-sm">
        <thead className="bg-[var(--ds-hover)]">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left font-medium uppercase tracking-wide text-[var(--ds-text-2)]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--ds-border)]">{children}</tbody>
      </table>
    </div>
  );
}

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "danger" | "warning" | "info";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-[var(--ds-hover)] text-[var(--ds-text-2)]",
    success: "bg-green-500/15 text-green-400",
    danger: "bg-red-500/15 text-red-400",
    warning: "bg-yellow-500/15 text-yellow-400",
    info: "bg-[#7E3AF0]/15 text-[#9F67FF]",
  };

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", tones[tone])}>
      {label}
    </span>
  );
}
