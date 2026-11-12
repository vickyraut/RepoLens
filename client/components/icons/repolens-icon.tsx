import type { ComponentProps, SVGProps } from "react";

import { cn } from "@/lib/utils";

type RepoLensIconProps = SVGProps<SVGSVGElement> & {
  variant?: "color" | "mono";
};

export function RepoLensIcon({
  className,
  variant = "color",
  ...props
}: RepoLensIconProps) {
  const mono = variant === "mono";

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect
        width="64"
        height="64"
        rx="15"
        fill={mono ? "currentColor" : "#0D9488"}
      />
      {/* Code bracket symbol / prompt */}
      <path
        d="M22 30l7 7-7 7"
        stroke={mono ? "var(--background)" : "#FFFFFF"}
        strokeWidth="3.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Search / lens line */}
      <path
        d="M33 44h15"
        stroke={mono ? "var(--background)" : "#FFFFFF"}
        strokeWidth="3.25"
        strokeLinecap="round"
      />
      <rect
        x="47"
        y="42.25"
        width="3"
        height="3.5"
        rx="0.75"
        fill={mono ? "var(--background)" : "#FFFFFF"}
      />
    </svg>
  );
}

export function RepoLensLogo({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 font-semibold tracking-tight", className)} {...props}>
      <RepoLensIcon className="size-8 rounded-[10px]" />
      <span className="font-heading text-[1.05rem] leading-none">RepoLens</span>
    </div>
  );
}
