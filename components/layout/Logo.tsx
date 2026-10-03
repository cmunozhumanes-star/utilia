import Link from "next/link";
import { site } from "@/data/site";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight" aria-label={`${site.name}, ir al inicio`}>
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="var(--accent)" />
        <path d="M10 9v8.5a6 6 0 0 0 12 0V9" fill="none" stroke="var(--accent-fg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {site.name}
    </Link>
  );
}
