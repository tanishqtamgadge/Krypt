import { NavLink, useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import { api } from "../api";

type Props = {
  username: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

const navItems = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/vault", icon: "lock", label: "Vault" },
  { to: "/uploads", icon: "upload_file", label: "Uploads" },
  { to: "/downloads", icon: "download", label: "Downloads" },
  { to: "/logs", icon: "terminal", label: "Logs" }
];

export function AppShell({ username, title, subtitle, children }: Props) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.logout();
    navigate("/");
  };

  return (
    <div className="cyber-bg min-h-screen bg-surface text-on-surface">
      <div className="soft-grid pointer-events-none fixed inset-0 z-0" />
      <aside className="fixed left-0 top-0 hidden h-full w-72 flex-col border-r border-cyan-900/10 bg-[#17181e]/95 lg:flex">
        <div className="border-b border-white/5 px-7 pb-6 pt-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_18px_rgba(70,241,255,0.8)]" />
            <span className="font-headline text-xl font-bold uppercase tracking-tighter text-primary">Krypt</span>
          </div>
          <div className="mb-1 flex items-center gap-3">
            <div className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
            <span className="font-headline text-xs uppercase tracking-widest">{username}</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/70">Encrypted Workspace</span>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-7 py-4 font-headline text-xs uppercase tracking-widest transition-all ${
                  isActive
                    ? "border-r-2 border-primary bg-primary/7 text-primary"
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                }`
              }
              to={item.to}
            >
              <span className="material-symbols-outlined text-sm">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/5 p-6">
          <button
            className="w-full rounded-sm bg-gradient-to-r from-primary to-cyan-300 px-4 py-3 font-headline text-[10px] font-bold uppercase tracking-widest text-[#00363a]"
            onClick={() => navigate("/uploads")}
          >
            Upload File
          </button>
          <button
            className="mt-3 w-full rounded border border-primary/20 px-4 py-3 font-headline text-[10px] font-bold uppercase tracking-widest text-primary transition hover:bg-primary/10"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="relative min-h-screen px-6 pb-16 pt-10 lg:ml-72 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="mb-2 font-headline text-4xl font-bold tracking-tighter md:text-5xl">{title}</h1>
            <p className="max-w-2xl text-sm text-on-surface-variant">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
