import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ variant = "primary", className = "", style, ...props }: Props) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    padding: "9px 18px",
    fontSize: "13px",
    fontWeight: 500,
    fontFamily: "'Outfit', sans-serif",
    cursor: "pointer",
    transition: "all 0.15s ease",
    border: "1px solid transparent",
    letterSpacing: "0.1px",
    whiteSpace: "nowrap" as const,
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: "#6366f1",
      color: "#ffffff",
      border: "1px solid rgba(99,102,241,0.5)",
      boxShadow: "0 0 16px rgba(99,102,241,0.2)",
    },
    secondary: {
      background: "rgba(255,255,255,0.05)",
      color: "#cbd5e1",
      border: "1px solid rgba(255,255,255,0.1)",
    },
    danger: {
      background: "rgba(239,68,68,0.1)",
      color: "#f87171",
      border: "1px solid rgba(239,68,68,0.3)",
    },
    ghost: {
      background: "transparent",
      color: "#64748b",
      border: "1px solid transparent",
    },
  };

  return (
    <button
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        if (variant === "primary") el.style.background = "#5254cc";
        if (variant === "secondary") el.style.background = "rgba(255,255,255,0.09)";
        if (variant === "danger") el.style.background = "rgba(239,68,68,0.18)";
        if (variant === "ghost") el.style.color = "#94a3b8";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        if (variant === "primary") el.style.background = "#6366f1";
        if (variant === "secondary") el.style.background = "rgba(255,255,255,0.05)";
        if (variant === "danger") el.style.background = "rgba(239,68,68,0.1)";
        if (variant === "ghost") el.style.color = "#64748b";
      }}
      className={className}
      {...props}
    />
  );
}