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

type VaultResponse = {
  username: string;
  userFiles: FileRecord[];
  totalUploads: number;
};

export function VaultPage({
  username,
  onMessage
}: {
  username: string;
  onMessage: (message: FlashMessage | null) => void;
}) {
  const [data, setData] = useState<VaultResponse | null>(null);
  const [shareTargets, setShareTargets] = useState<Record<number, string>>({});
  const [sharingId, setSharingId] = useState<number | null>(null);

  const loadVault = async () => {
    const response = await api.vault();
    setData(response);
  };

  useEffect(() => {
    loadVault().catch((error) => {
      onMessage({ category: "error", message: error instanceof Error ? error.message : "Failed to load vault." });
    });
  }, []);

  const handleShare = async (fileId: number) => {
    const sharedWith = (shareTargets[fileId] || "").trim();
    if (!sharedWith) {
      onMessage({ category: "error", message: "Enter a username before sharing the file." });
      return;
    }

    setSharingId(fileId);
    try {
      const result = await api.share(fileId, sharedWith);
      onMessage({ category: "success", message: result.message });
      setShareTargets((current) => ({ ...current, [fileId]: "" }));
    } catch (error) {
      onMessage({ category: "error", message: error instanceof Error ? error.message : "Share failed." });
    } finally {
      setSharingId(null);
    }
  };

  if (!data) {
    return (
      <AppShell subtitle="Your private library of encrypted files, ready to download or share." title="MY FILES" username={username}>
        <LoadingPanel title="My Files" />
      </AppShell>
    );
  }

  const totalBytes = data.userFiles.reduce((sum, file) => sum + (file.file_size || 0), 0);

  return (
    <AppShell subtitle="Your private library of encrypted files, ready to download or share." title="MY FILES" username={username}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon="folder_zip" label="Stored Files" meta="Encrypted files available" tone="primary" value={data.totalUploads} />
        <StatCard icon="database" label="Storage Used" meta="Protected account storage" tone="secondary" value={formatFileSize(totalBytes)} />
        <StatCard
          icon="schedule"
          label="Latest Upload"
          meta="Most recent file added"
          tone="tertiary"
          value={data.userFiles[0] ? formatTimestamp(data.userFiles[0].uploaded_at) : "No uploads"}
        />
      </div>

      <Panel title="File Library" subtitle="Download your files or share them with another registered user.">
        {data.userFiles.length === 0 ? (
          <EmptyState title="No files yet" description="Upload your first file to start building your secure library." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="pb-4 pr-4 font-headline">Filename</th>
                  <th className="pb-4 pr-4 font-headline">Size</th>
                  <th className="pb-4 pr-4 font-headline">Uploaded</th>
                  <th className="pb-4 pr-4 font-headline">Share With</th>
                  <th className="pb-4 text-right font-headline">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.userFiles.map((file) => (
                  <tr key={file.id}>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary/70">enhanced_encryption</span>
                        <div>
                          <div className="text-sm text-on-surface">{file.filename}</div>
                          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Encrypted</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-sm text-on-surface-variant">{formatFileSize(file.file_size)}</td>
                    <td className="py-4 pr-4 text-sm text-on-surface-variant">{formatTimestamp(file.uploaded_at)}</td>
                    <td className="py-4 pr-4">
                      <input
                        className="w-full rounded border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary"
                        onChange={(event) =>
                          setShareTargets((current) => ({ ...current, [file.id]: event.target.value }))
                        }
                        placeholder="Enter username"
                        value={shareTargets[file.id] || ""}
                      />
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded border border-secondary/20 px-3 py-2 text-xs font-bold uppercase tracking-widest text-secondary transition hover:bg-secondary/10"
                          disabled={sharingId === file.id}
                          onClick={() => handleShare(file.id)}
                        >
                          {sharingId === file.id ? "Sharing..." : "Share"}
                        </button>
                        <button
                          className="rounded border border-primary/20 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary transition hover:bg-primary/10"
                          onClick={() => startFileDownload(`/api/download/${file.id}`)}
                        >
                          Download
                        </button>
                        <button
                          className="rounded border border-outline-variant/20 px-3 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant transition hover:bg-white/5"
                          onClick={() => startFileDownload(`/api/download-encrypted/${file.id}`)}
                        >
                          Encrypted
                        </button>
                      </div>
                    </td>
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
