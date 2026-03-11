import { PropsWithChildren } from "react";

export function Card({
  title,
  children,
  className = "",
}: PropsWithChildren<{ title?: string; className?: string }>) {
  return (
    <div className={`rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      {title ? <h2 className="text-lg font-bold text-primaryDark">{title}</h2> : null}
      <div className={title ? "mt-4" : ""}>{children}</div>
    </div>
  );
}


