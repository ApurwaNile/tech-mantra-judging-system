import { PropsWithChildren } from "react";

type CardProps = {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  variant?: "default" | "highlight" | "danger";
};

export function Card({
  title,
  subtitle,
  action,
  variant = "default",
  children,
}: PropsWithChildren<CardProps>) {
  const backgrounds: Record<string, string> = {
    default: "rgba(255,255,255,0.03)",
    highlight: "rgba(99,102,241,0.06)",
    danger: "rgba(239,68,68,0.06)",
  };

  const borders: Record<string, string> = {
    default: "1px solid rgba(255,255,255,0.07)",
    highlight: "1px solid rgba(99,102,241,0.2)",
    danger: "1px solid rgba(239,68,68,0.2)",
  };

  return (
    <div
      style={{
        background: backgrounds[variant],
        border: borders[variant],
        borderRadius: "16px",
        padding: "20px",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: children ? "16px" : 0,
          }}
        >
          <div>
            {title && (
              <h2
                style={{
                  color: "#f1f5f9",
                  fontSize: "15px",
                  fontWeight: 600,
                  margin: 0,
                  letterSpacing: "-0.2px",
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                style={{
                  color: "#64748b",
                  fontSize: "12px",
                  margin: "3px 0 0",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

// Reusable dark table styles — import and use across pages
export const tableStyles = {
  wrapper: {
    overflowX: "auto" as const,
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.06)",
  } as React.CSSProperties,
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "13px",
    fontFamily: "'Outfit', sans-serif",
  } as React.CSSProperties,
  th: {
    padding: "10px 14px",
    textAlign: "left" as const,
    color: "#475569",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
  } as React.CSSProperties,
  td: {
    padding: "12px 14px",
    color: "#cbd5e1",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  } as React.CSSProperties,
  trHover: {
    background: "rgba(255,255,255,0.02)",
  } as React.CSSProperties,
};

// Reusable dark input style — spread onto any <input> or <select>
export const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  padding: "10px 14px",
  color: "#f1f5f9",
  fontSize: "14px",
  outline: "none",
  fontFamily: "'Outfit', sans-serif",
  boxSizing: "border-box",
};

export const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: 500,
  marginBottom: "6px",
  letterSpacing: "0.3px",
};