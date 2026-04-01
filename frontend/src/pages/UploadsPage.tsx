import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { api } from "../api";
import { AppShell } from "../components/AppShell";
import {
  EmptyState,
  LoadingPanel,
  Panel,
  formatFileSize,
  formatTimestamp,
  startFileDownload
} from "../components/PageBlocks";
import type { FileRecord, FlashMessage } from "../types";

type UploadsResponse = {
  username: string;
  userFiles: FileRecord[];
  totalUploads: number;
};

export function UploadsPage({
  username,
  onMessage
}: {
  username: string;
  onMessage: (message: FlashMessage | null) => void;
}) {
  const [data, setData] = useState<UploadsResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const loadUploads = async () => {
    const response = await api.vault();
    setData(response);
  };

  useEffect(() => {
    loadUploads().catch((error) => {
      onMessage({ category: "error", message: error instanceof Error ? error.message : "Failed to load uploads." });
    });
  }, []);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] || null);
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      onMessage({ category: "error", message: "Choose a file before starting the upload." });
      return;
    }

    setUploading(true);
    try {
      const result = await api.upload(selectedFile);
      onMessage({ category: "success", message: result.message });
      setSelectedFile(null);
      setInputKey((current) => current + 1);
      await loadUploads();
    } catch (error) {
      onMessage({ category: "error", message: error instanceof Error ? error.message : "Upload failed." });
    } finally {
      setUploading(false);
    }
  };

  if (!data) {
    return (
      <AppShell subtitle="Add a file, encrypt it automatically, and save it to your account." title="UPLOADS" username={username}>
        <LoadingPanel title="Uploads" />
      </AppShell>
    );
  }

  return (
    <AppShell subtitle="Add a file, encrypt it automatically, and save it to your account." title="UPLOADS" username={username}>
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel title="Upload a File" subtitle="Choose a file and Krypt will encrypt it before storing it in your account.">
            <form className="space-y-6" onSubmit={handleUpload}>
              <label className="lift-card block cursor-pointer rounded-xl border-2 border-dashed border-primary/30 bg-surface-container-lowest/50 p-10 text-center transition hover:border-primary/60 hover:bg-primary/5">
                <span className="material-symbols-outlined mb-4 block text-5xl text-primary">upload_file</span>
                <span className="block font-headline text-lg uppercase tracking-[0.18em] text-on-surface">Select a File</span>
                <span className="mt-2 block text-sm text-on-surface-variant">
                  Drag a file here or click to browse from your device.
                </span>
                <input key={inputKey} className="hidden" onChange={handleFileSelect} type="file" />
              </label>

              <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low px-4 py-4">
                <div className="font-headline text-[10px] uppercase tracking-[0.2em] text-slate-500">Selected File</div>
                <div className="mt-3 text-sm text-on-surface">
                  {selectedFile ? `${selectedFile.name} - ${formatFileSize(selectedFile.size)}` : "No file selected yet."}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="rounded bg-gradient-to-r from-primary to-primary-container px-6 py-3 font-headline text-xs font-bold uppercase tracking-[0.2em] text-on-primary disabled:opacity-60"
                  disabled={uploading}
                  type="submit"
                >
                  {uploading ? "Uploading..." : "Encrypt & Upload"}
                </button>
                <button
                  className="rounded border border-outline-variant/20 px-6 py-3 font-headline text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant transition hover:border-primary/30 hover:text-primary"
                  onClick={() => {
                    setSelectedFile(null);
                    setInputKey((current) => current + 1);
                  }}
                  type="button"
                >
                  Reset
                </button>
              </div>
            </form>
          </Panel>
        </div>

        <Panel title="Recent Uploads" subtitle="Your latest encrypted files appear here after each upload.">
          {data.userFiles.length === 0 ? (
            <EmptyState title="No uploads yet" description="Your uploaded files will appear here as soon as the first upload finishes." />
          ) : (
            <div className="space-y-4">
              {data.userFiles.slice(0, 5).map((file) => (
                <div key={file.id} className="lift-card rounded-lg border border-outline-variant/10 bg-surface-container-low p-4">
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="break-words text-sm text-on-surface">{file.filename}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        {formatFileSize(file.file_size)} - {formatTimestamp(file.uploaded_at)}
                      </div>
                    </div>
                    <button
                      className="w-full rounded border border-primary/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary transition hover:bg-primary/10 sm:w-auto sm:self-start"
                      onClick={() => startFileDownload(`/api/download/${file.id}`)}
                    >
                      Download
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

