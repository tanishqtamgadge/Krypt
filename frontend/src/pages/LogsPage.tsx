import { useEffect, useState } from "react";
import { api } from "../api";
import { AppShell } from "../components/AppShell";
import {
  EmptyState,
  LoadingPanel,
  Panel,
  StatCard,
  actionTone,
  formatTimestamp
} from "../components/PageBlocks";
import type { AuditLog, FlashMessage } from "../types";

type LogsResponse = {
  username: string;
  auditLogs: AuditLog[];
  activityCount: number;
};

export function LogsPage({
  username,
  onMessage
}: {
  username: string;
  onMessage: (message: FlashMessage | null) => void;
}) {
  const [data, setData] = useState<LogsResponse | null>(null);

  useEffect(() => {
    api.logs().then(setData).catch((error) => {
      onMessage({ category: "error", message: error instanceof Error ? error.message : "Failed to load logs." });
    });
  }, []);

  if (!data) {
    return (
      <AppShell subtitle="A timeline of uploads, downloads, sharing actions, and account activity." title="ACTIVITY LOGS" username={username}>
        <LoadingPanel title="Activity Logs" />
      </AppShell>
    );
  }

  return (
    <AppShell subtitle="A timeline of uploads, downloads, sharing actions, and account activity." title="ACTIVITY LOGS" username={username}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon="history" label="Event Count" meta="Tracked account actions" tone="primary" value={data.activityCount} />
        <StatCard
          icon="bolt"
          label="Latest Action"
          meta="Most recent recorded event"
          tone="secondary"
          value={data.auditLogs[0] ? data.auditLogs[0].action.replace(/_/g, " ") : "None"}
        />
        <StatCard
          icon="schedule"
          label="Last Activity"
          meta="Latest event time"
          tone="tertiary"
          value={data.auditLogs[0] ? formatTimestamp(data.auditLogs[0].created_at) : "No activity"}
        />
      </div>

      <Panel title="Activity Stream" subtitle="Recent actions recorded for your account.">
        {data.auditLogs.length === 0 ? (
          <EmptyState title="No activity yet" description="Uploads, downloads, shares, and sign-ins will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="pb-4 pr-4 font-headline">Timestamp</th>
                  <th className="pb-4 pr-4 font-headline">Action</th>
                  <th className="pb-4 pr-4 font-headline">Target</th>
                  <th className="pb-4 font-headline">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.auditLogs.map((entry, index) => (
                  <tr key={`${entry.created_at}-${entry.action}-${index}`}>
                    <td className="py-4 pr-4 text-sm text-on-surface-variant">{formatTimestamp(entry.created_at)}</td>
                    <td className="py-4 pr-4">
                      <span className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] ${actionTone(entry.action)}`}>
                        {entry.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-sm text-on-surface-variant">
                      {entry.target_type}
                      {entry.target_id ? ` #${entry.target_id}` : ""}
                    </td>
                    <td className="py-4 text-sm text-on-surface">{entry.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
