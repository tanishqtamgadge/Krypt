import type { FlashMessage } from "../types";

export function FlashBanner({ message }: { message: FlashMessage | null }) {
  if (!message) return null;

  const tone =
    message.category === "success"
      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
      : "border-rose-400/40 bg-rose-500/10 text-rose-100";

  return <div className={`rounded-lg border px-4 py-3 text-sm ${tone}`}>{message.message}</div>;
}
