import type { ReactNode } from "react";

export function formatFileSize(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
}

export function formatTimestamp(value?: string) {
  if (!value) return "No activity yet";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

export function actionTone(action: string) {
  const normalized = action.toLowerCase();
  if (normalized.includes("fail") || normalized.includes("error")) {
    return "border-error/30 bg-error/10 text-error";
  }
  if (normalized.includes("share")) {
    return "border-secondary/30 bg-secondary/10 text-secondary";
  }
  if (normalized.includes("register")) {
    return "border-tertiary/30 bg-tertiary/10 text-tertiary";
  }
  return "border-primary/30 bg-primary/10 text-primary";
}

export function startFileDownload(path: string) {
  window.location.href = path;
}

export function StatCard({
  icon,
  label,
  value,
  meta,
  tone = "primary"
}: {
  icon: string;
  label: string;
  value: string | number;
  meta: string;
  tone?: "primary" | "secondary" | "tertiary";
}) {
  const toneClasses = {
    primary: "border-primary/30 text-primary",
    secondary: "border-secondary/30 text-secondary",
    tertiary: "border-tertiary/30 text-tertiary"
  };

  return (
    <div className={`lift-card rounded-xl border border-white/5 border-l-2 bg-surface-container-low p-6 ${toneClasses[tone]}`}>
      <div className="mb-4 flex items-start justify-between">
        <span className="material-symbols-outlined opacity-70">{icon}</span>
        <span className="font-headline text-[10px] uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <div className="mb-1 font-headline text-3xl font-bold text-on-surface">{value}</div>
      <div className="text-xs uppercase tracking-tighter text-on-surface-variant">{meta}</div>
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="glass-panel lift-card overflow-hidden rounded-xl border border-outline-variant/10">
      <div className="flex flex-col gap-3 border-b border-white/5 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-on-surface">{title}</h2>
          {subtitle ? <p className="mt-2 text-sm text-on-surface-variant">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-outline-variant/30 bg-surface-container-lowest/50 px-6 py-10 text-center">
      <div className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-primary">{title}</div>
      <p className="mx-auto mt-3 max-w-xl text-sm text-on-surface-variant">{description}</p>
    </div>
  );
}

export function LoadingPanel({ title }: { title: string }) {
  return (
    <div className="glass-panel rounded-xl border border-outline-variant/10 px-6 py-10">
      <div className="font-headline text-xs uppercase tracking-[0.2em] text-primary">{title}</div>
      <p className="mt-3 text-sm text-on-surface-variant">Loading secure data stream...</p>
    </div>
  );
}
