import { useEffect, useState } from "react";
import { api } from "../api";
import { AppShell } from "../components/AppShell";
import {
  EmptyState,
  LoadingPanel,
  Panel,
  StatCard,
  formatFileSize,
  formatTimestamp,
  startFileDownload
} from "../components/PageBlocks";
import type { FileRecord, FlashMessage } from "../types";

type DownloadsResponse = {
  username: string;
  userFiles: FileRecord[];
  sharedFiles: FileRecord[];
  totalDownloads: number;
};

export function DownloadsPage({
  username,
  onMessage
}: {
  username: string;
  onMessage: (message: FlashMessage | null) => void;
}) {
  const [data, setData] = useState<DownloadsResponse | null>(null);

  useEffect(() => {
    api.downloads().then(setData).catch((error) => {
      onMessage({ category: "error", message: error instanceof Error ? error.message : "Failed to load downloads." });
    });
  }, []);

  if (!data) {
    return (
      <AppShell subtitle="Download your own files or anything that has been shared with you." title="DOWNLOADS" username={username}>
        <LoadingPanel title="Downloads" />
      </AppShell>
    );
  }

  return (
    <AppShell subtitle="Download your own files or anything that has been shared with you." title="DOWNLOADS" username={username}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon="download" label="Available Files" meta="Owned and shared assets" tone="primary" value={data.totalDownloads} />
        <StatCard icon="lock_open" label="My Files" meta="Ready to download" tone="secondary" value={data.userFiles.length} />
        <StatCard icon="share" label="Shared With Me" meta="Files from other users" tone="tertiary" value={data.sharedFiles.length} />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <Panel title="My Downloads" subtitle="Files you uploaded and can download directly.">
          {data.userFiles.length === 0 ? (
            <EmptyState title="No files yet" description="Upload files first and they will appear here for download." />
          ) : (
            <div className="space-y-4">
              {data.userFiles.map((file) => (
                <div key={file.id} className="lift-card flex flex-col gap-4 rounded-lg border border-outline-variant/10 bg-surface-container-low p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm text-on-surface">{file.filename}</div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      {formatFileSize(file.file_size)} - {formatTimestamp(file.uploaded_at)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="rounded bg-gradient-to-r from-primary to-primary-container px-4 py-3 font-headline text-xs font-bold uppercase tracking-[0.18em] text-on-primary"
                      onClick={() => startFileDownload(`/api/download/${file.id}`)}
                    >
                      Download
                    </button>
                    <button
                      className="rounded border border-outline-variant/20 px-4 py-3 font-headline text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant transition hover:bg-white/5"
                      onClick={() => startFileDownload(`/api/download-encrypted/${file.id}`)}
                    >
                      Download Encrypted
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Shared Downloads" subtitle="Files other users have shared with your account.">
          {data.sharedFiles.length === 0 ? (
            <EmptyState title="Nothing shared yet" description="When another user shares a file with you, it will appear here." />
          ) : (
            <div className="space-y-4">
              {data.sharedFiles.map((file) => (
                <div key={`${file.id}-${file.owner || "owner"}`} className="lift-card flex flex-col gap-4 rounded-lg border border-outline-variant/10 bg-surface-container-low p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm text-on-surface">{file.filename}</div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      Shared by {file.owner} - {formatFileSize(file.file_size)} - {formatTimestamp(file.shared_at || file.uploaded_at)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="rounded border border-secondary/20 px-4 py-3 font-headline text-xs font-bold uppercase tracking-[0.18em] text-secondary transition hover:bg-secondary/10"
                      onClick={() => startFileDownload(`/api/shared-download/${file.id}`)}
                    >
                      Download Shared File
                    </button>
                    <button
                      className="rounded border border-outline-variant/20 px-4 py-3 font-headline text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant transition hover:bg-white/5"
                      onClick={() => startFileDownload(`/api/shared-download-encrypted/${file.id}`)}
                    >
                      Download Encrypted
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}

