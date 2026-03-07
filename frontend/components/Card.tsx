import { PropsWithChildren } from "react";

export function Card({
  title,
  children,
}: PropsWithChildren<{ title?: string }>) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
      {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </div>
  );
}

