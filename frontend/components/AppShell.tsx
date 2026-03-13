"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useState } from "react";

type AppShellProps = {
  title: string;
  subtitle?: string;
  variant?: "default" | "admin" | "coordinator";
};

const adminLinks = [
  { href: "/admin", label: "Overview", icon: "⬡" },
  { href: "/admin/events", label: "Events", icon: "◈" },
  { href: "/admin/participants", label: "Participants", icon: "◉" },
  { href: "/admin/judges", label: "Judges", icon: "◆" },
  { href: "/admin/coordinators", label: "Coordinators", icon: "◇" },
  { href: "/admin/assignments", label: "Assignments", icon: "⬗" },
  { href: "/admin/results", label: "Results", icon: "◎" },
];

export function AppShell({
  title,
  subtitle,
  variant = "default",
  children,
}: PropsWithChildren<AppShellProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (variant === "admin") {
    return (
      <div className="min-h-screen" style={{ background: "#0a0a0f", fontFamily: "'Outfit', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
          * { font-family: 'Outfit', sans-serif; }
          .mono { font-family: 'DM Mono', monospace; }
          .glow { box-shadow: 0 0 30px rgba(99,102,241,0.15); }
          .nav-active { background: rgba(99,102,241,0.15); color: #818cf8; border-left: 2px solid #6366f1; }
          .nav-item { border-left: 2px solid transparent; transition: all 0.15s ease; }
          .nav-item:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; border-left: 2px solid rgba(99,102,241,0.4); }
          .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 40; backdrop-filter: blur(4px); }
          .card-dark { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; }
          @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
          .sidebar-mobile { animation: slideIn 0.25s ease; }
        `}</style>

        {/* Top Header */}
        <header style={{ background: "rgba(10,10,15,0.95)", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 30 }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                style={{ display: "none", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 10px", color: "#94a3b8", cursor: "pointer" }}
                className="mobile-menu-btn"
                type="button"
              >
                <style>{`.mobile-menu-btn { display: block !important; } @media (min-width: 900px) { .mobile-menu-btn { display: none !important; } }`}</style>
                ☰
              </button>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1", display: "inline-block", boxShadow: "0 0 8px #6366f1" }} />
                  <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "15px", letterSpacing: "-0.3px" }}>{title}</span>
                </div>
                {subtitle && <div style={{ color: "#64748b", fontSize: "11px", marginTop: "1px" }}>{subtitle}</div>}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Link
                href="/login"
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  background: "rgba(148,163,184,0.08)",
                  border: "1px solid rgba(148,163,184,0.35)",
                  color: "#cbd5e1",
                  fontSize: "12px",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                Judge View ↗
              </Link>
              <button
                onClick={handleLogout}
                style={{ padding: "6px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
                type="button"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <>
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            <aside className="sidebar-mobile" style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "260px", background: "#0d0d14", borderRight: "1px solid rgba(255,255,255,0.08)", zIndex: 50, padding: "24px 16px", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <span style={{ color: "#475569", fontSize: "10px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>Navigation</span>
                <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px" }} type="button">✕</button>
              </div>
              <SidebarLinks pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
            </aside>
          </>
        )}

        {/* Main Layout */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px", display: "flex", gap: "24px" }}>
          {/* Desktop Sidebar */}
          <aside style={{ width: "220px", flexShrink: 0 }} className="desktop-sidebar">
            <style>{`@media (max-width: 899px) { .desktop-sidebar { display: none; } }`}</style>
            <div className="card-dark" style={{ padding: "20px 12px", position: "sticky", top: "84px" }}>
              <div style={{ color: "#334155", fontSize: "10px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px", paddingLeft: "10px" }}>Navigation</div>
              <SidebarLinks pathname={pathname} />
            </div>
          </aside>

          {/* Content */}
          <main style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (variant === "coordinator") {
    return (
      <div className="min-h-screen" style={{ background: "#0a0a0f", fontFamily: "'Outfit', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');`}</style>
        <header style={{ background: "rgba(10,10,15,0.95)", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 30 }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px #10b981" }} />
                <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "15px", letterSpacing: "-0.3px" }}>{title}</span>
              </div>
              {subtitle && <div style={{ color: "#64748b", fontSize: "11px", marginTop: "1px" }}>{subtitle}</div>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Link
                href="/coordinator/dashboard"
                style={{
                  padding: "0",
                  borderRadius: "0",
                  background: "transparent",
                  border: "none",
                  color: "#cbd5e1",
                  fontSize: "12px",
                  fontWeight: 500,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                style={{ padding: "6px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
                type="button"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 20px" }}>
          {children}
        </main>
      </div>
    );
  }

  // Default (judge)
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');`}</style>
      <header style={{ background: "rgba(10,10,15,0.95)", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", display: "inline-block", boxShadow: "0 0 8px #f59e0b" }} />
              <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "15px", letterSpacing: "-0.3px" }}>{title}</span>
            </div>
            {subtitle && <div style={{ color: "#64748b", fontSize: "11px", marginTop: "1px" }}>{subtitle}</div>}
          </div>
          <button
            onClick={handleLogout}
            style={{ padding: "6px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
            type="button"
          >
            Logout
          </button>
        </div>
      </header>
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "28px 20px" }}>
        {children}
      </main>
    </div>
  );
}

function SidebarLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {adminLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`nav-item ${isActive ? "nav-active" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              borderRadius: "8px",
              textDecoration: "none",
              color: isActive ? "#818cf8" : "#64748b",
              fontSize: "13px",
              fontWeight: isActive ? 600 : 400,
            }}
          >
            <span style={{ fontSize: "12px", opacity: 0.7 }}>{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Password Input with Eye Toggle ──────────────────────────────────────────
// Export this and use it anywhere you have a password field
export function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  name,
  id,
  style,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  style?: React.CSSProperties;
}) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: "relative", ...style }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        id={id}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "10px",
          padding: "10px 44px 10px 14px",
          color: "#f1f5f9",
          fontSize: "14px",
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "'Outfit', sans-serif",
        }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#64748b",
          fontSize: "16px",
          padding: "0",
          lineHeight: 1,
        }}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? "🙈" : "👁"}
      </button>
    </div>
  );
}