import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "./api";
import type { FlashMessage, SessionResponse } from "./types";
import { FlashBanner } from "./components/FlashBanner";
import { AppShell } from "./components/AppShell";
import { VaultPage } from "./pages/VaultPage";
import { UploadsPage } from "./pages/UploadsPage";
import { DownloadsPage } from "./pages/DownloadsPage";
import { LogsPage } from "./pages/LogsPage";

function AuthPage({
  mode,
  onMessage
}: {
  mode: "login" | "register";
  onMessage: (message: FlashMessage | null) => void;
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const isRegister = mode === "register";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (mode === "login") {
        await api.login(username, password);
        window.location.href = "/dashboard";
        return;
      }
      if (password !== confirmPassword) {
        onMessage({ category: "error", message: "Password and confirm password must match." });
        return;
      }
      if (!acceptedTerms) {
        onMessage({ category: "error", message: "Please accept the Krypt terms to create your account." });
        return;
      }
      const result = await api.register(username, password);
      onMessage({ category: "success", message: result.message });
      window.location.href = "/";
    } catch (error) {
      onMessage({ category: "error", message: error instanceof Error ? error.message : "Request failed." });
    }
  };

  return (
    <div className="cyber-bg enroll-bg relative flex min-h-screen items-center justify-center overflow-hidden bg-surface p-6 text-on-surface">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 scanline opacity-30"></div>
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] rounded-full bg-secondary/5 blur-[150px]"></div>
      </div>

      <main className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="glass-panel auth-hero hidden min-h-[680px] rounded-[28px] border border-white/8 p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-10 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              </span>
              <div>
                <div className="font-headline text-3xl font-black uppercase tracking-tight text-primary">Krypt</div>
                <div className="text-[11px] uppercase tracking-[0.32em] text-on-surface-variant/70">Secure File Exchange</div>
              </div>
            </div>

            <div className="max-w-xl">
              <h1 className="font-headline text-5xl font-black leading-none text-on-surface">
                {isRegister ? "Private file sharing that feels effortless." : "Welcome back to your secure workspace."}
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-on-surface-variant">
                {isRegister
                  ? "Create your account to encrypt uploads, share files with trusted users, and keep a clean activity trail."
                  : "Sign in to manage your files, review downloads, and keep everything inside one protected dashboard."}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-primary/80">Protected</div>
              <div className="mt-3 text-sm text-on-surface-variant">Encrypted uploads and controlled sharing built in.</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-primary/80">Tracked</div>
              <div className="mt-3 text-sm text-on-surface-variant">Activity logs keep account actions visible and easy to review.</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-primary/80">Simple</div>
              <div className="mt-3 text-sm text-on-surface-variant">A clean workspace for uploads, downloads, and file access.</div>
            </div>
          </div>
        </section>

        <section className="glass-panel relative rounded-[28px] border border-outline-variant/20 bg-surface-container/70 p-8 shadow-[0_28px_80px_rgba(0,0,0,0.35)] sm:p-10">
          <div className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-primary/40"></div>
          <div className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-primary/40"></div>
          <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-primary/40"></div>
          <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-primary/40"></div>

          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              </span>
              <div>
                <div className="font-headline text-2xl font-black uppercase tracking-tight text-primary">Krypt</div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-on-surface-variant/70">Secure File Exchange</div>
              </div>
            </div>
          </div>

          <header className="mb-8">
            <div className="text-[11px] uppercase tracking-[0.28em] text-primary/75">
              {isRegister ? "Create Account" : "Login"}
            </div>
            <h2 className="mt-3 font-headline text-3xl font-black tracking-tight text-on-surface">
              {isRegister ? "Create Your Krypt Account" : "Sign In to Krypt"}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-on-surface-variant">
              {isRegister
                ? "Set up your account to upload, share, and manage encrypted files."
                : "Use your username and password to open your secure workspace."}
            </p>
          </header>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block font-headline text-[11px] uppercase tracking-wider text-on-surface-variant">
                Username
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  fingerprint
                </span>
                <input
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-highest/40 py-4 pl-12 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-outline/50 focus:border-primary focus:bg-surface-container-highest/60"
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username"
                  required
                  value={username}
                />
              </div>
            </div>

            {isRegister ? (
              <>
                <div>
                  <label className="mb-2 block font-headline text-[11px] uppercase tracking-wider text-on-surface-variant">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                      alternate_email
                    </span>
                    <input
                      className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-highest/40 py-4 pl-12 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-outline/50 focus:border-primary focus:bg-surface-container-highest/60"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Enter your email address"
                      type="email"
                      value={email}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-headline text-[11px] uppercase tracking-wider text-on-surface-variant">
                      Password
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                        key
                      </span>
                      <input
                        className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-highest/40 py-4 pl-12 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-outline/50 focus:border-primary focus:bg-surface-container-highest/60"
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Create a password"
                        required
                        type="password"
                        value={password}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block font-headline text-[11px] uppercase tracking-wider text-on-surface-variant">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                        lock_reset
                      </span>
                      <input
                        className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-highest/40 py-4 pl-12 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-outline/50 focus:border-primary focus:bg-surface-container-highest/60"
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Repeat your password"
                        required
                        type="password"
                        value={confirmPassword}
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-4">
                  <input
                    checked={acceptedTerms}
                    className="mt-1 h-4 w-4 rounded border-outline-variant bg-surface-container-highest text-primary focus:ring-primary focus:ring-offset-surface"
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    type="checkbox"
                  />
                  <span className="text-[12px] leading-6 text-on-surface-variant">
                    I agree to the <span className="text-primary">Krypt</span> terms and consent to secure file handling.
                  </span>
                </label>
              </>
            ) : (
              <div>
                <label className="mb-2 block font-headline text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    key
                  </span>
                  <input
                    className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-highest/40 py-4 pl-12 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-outline/50 focus:border-primary focus:bg-surface-container-highest/60"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    type="password"
                    value={password}
                  />
                </div>
              </div>
            )}

            <button className="w-full rounded-2xl bg-gradient-to-r from-primary to-primary-container py-4 font-headline text-sm font-bold uppercase tracking-[0.22em] text-[#00363a] shadow-[0_18px_40px_rgba(0,213,226,0.22)]">
              {isRegister ? "Create Account" : "Login"}
            </button>
          </form>

          <footer className="mt-8 border-t border-outline-variant/10 pt-6 text-center">
            <p className="text-sm text-on-surface-variant">
              {isRegister ? "Already have an account?" : "Need an account?"}
              <a className="ml-2 font-headline text-xs uppercase tracking-[0.2em] text-primary" href={isRegister ? "/" : "/register"}>
                {isRegister ? "Log In" : "Register"}
              </a>
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
}

function DashboardPage({ username }: { username: string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    api.dashboard().then(setData);
  }, []);

  if (!data) return null;

  return (
    <AppShell subtitle="A quick view of uploads, sharing activity, and recent account events." title="OVERVIEW" username={username}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border-l-2 border-primary/30 bg-surface-container-low p-6"><div className="mb-4 flex items-start justify-between"><span className="material-symbols-outlined text-primary/50">cloud_upload</span><span className="font-headline text-[10px] uppercase tracking-widest text-slate-500">Live Metrics</span></div><div className="mb-1 font-headline text-3xl font-bold">{data.totalUploads}</div><div className="text-xs uppercase tracking-tighter text-on-surface-variant">Total Secure Uploads</div></div>
        <div className="rounded-md border-l-2 border-secondary/30 bg-surface-container-low p-6"><div className="mb-4 flex items-start justify-between"><span className="material-symbols-outlined text-secondary/50">hub</span><span className="font-headline text-[10px] uppercase tracking-widest text-slate-500">Connectivity</span></div><div className="mb-1 font-headline text-3xl font-bold">{data.totalShared}</div><div className="text-xs uppercase tracking-tighter text-on-surface-variant">Shared Access Nodes</div></div>
        <div className="rounded-md border-l-2 border-tertiary/30 bg-surface-container-low p-6"><div className="mb-4 flex items-start justify-between"><span className="material-symbols-outlined text-tertiary/50">verified_user</span><span className="font-headline text-[10px] uppercase tracking-widest text-slate-500">Verification</span></div><div className="mb-1 font-headline text-lg font-bold">{data.recentActivity[0]?.created_at ?? "No Activity"}</div><div className="text-xs uppercase tracking-tighter text-on-surface-variant">Last Logged Event</div></div>
        <div className="rounded-md border-l-2 border-primary/30 bg-surface-container-low p-6"><div className="mb-4 flex items-start justify-between"><div className="mt-1 h-2 w-2 animate-pulse rounded-full bg-primary"></div><span className="font-headline text-[10px] uppercase tracking-widest text-slate-500">Status</span></div><div className="mb-1 font-headline text-3xl font-bold text-primary">{data.activityCount}</div><div className="text-xs uppercase tracking-tighter text-on-surface-variant">Tracked System Events</div></div>
      </div>
    </AppShell>
  );
}

export default function App() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [message, setMessage] = useState<FlashMessage | null>(null);

  useEffect(() => {
    api.session().then(setSession).catch(() => setSession({ authenticated: false, username: null }));
  }, []);

  if (!session) return null;

  return (
    <>
      <div className="fixed left-1/2 top-4 z-[100] w-full max-w-xl -translate-x-1/2 px-4">
        <FlashBanner message={message} />
      </div>
      <Routes>
        <Route path="/" element={session.authenticated ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" onMessage={setMessage} />} />
        <Route path="/register" element={session.authenticated ? <Navigate to="/dashboard" replace /> : <AuthPage mode="register" onMessage={setMessage} />} />
        <Route path="/dashboard" element={session.authenticated && session.username ? <DashboardPage username={session.username} /> : <Navigate to="/" replace />} />
        <Route path="/vault" element={session.authenticated && session.username ? <VaultPage onMessage={setMessage} username={session.username} /> : <Navigate to="/" replace />} />
        <Route path="/uploads" element={session.authenticated && session.username ? <UploadsPage onMessage={setMessage} username={session.username} /> : <Navigate to="/" replace />} />
        <Route path="/downloads" element={session.authenticated && session.username ? <DownloadsPage onMessage={setMessage} username={session.username} /> : <Navigate to="/" replace />} />
        <Route path="/logs" element={session.authenticated && session.username ? <LogsPage onMessage={setMessage} username={session.username} /> : <Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
