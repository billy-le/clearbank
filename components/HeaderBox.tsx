"use client";

import { useAppState } from "@/lib/providers/app.provider";

export function HeaderBox({ type = "title", title, subtext }: HeaderBoxProps) {
  const {
    state: { user },
  } = useAppState();

  return (
    <div className="header-box">
      <h1 className="header-box-title">
        {title}
        {type === "greeting" && (
          <span className="text-bankGradient">
            &nbsp;{`${user?.firstName} ${user?.lastName}`}
          </span>
        )}
      </h1>
      <p className="header-box-subtext">{subtext}</p>
    </div>
  );
}
