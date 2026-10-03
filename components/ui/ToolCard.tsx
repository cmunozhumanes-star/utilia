import Link from "next/link";
import { CategoryIcon, ChevronIcon } from "@/components/ui/icons";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { getCategoryOf, toolPath } from "@/lib/tools/registry";
import type { ToolDefinition } from "@/lib/tools/types";

/** Fila de herramienta. Con `from` registra el evento click_related_tool. */
export function ToolCard({ tool, from }: { tool: ToolDefinition; from?: string }) {
  const icon = getCategoryOf(tool).icon;
  const className =
    "group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent";
  const body = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-soft text-accent">
        <CategoryIcon name={icon} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{tool.name}</span>
        <span className="block text-sm text-muted">{tool.summary}</span>
      </span>
      <ChevronIcon className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
    </>
  );
  return from ? (
    <TrackedLink href={toolPath(tool)} className={className} event="click_related_tool" eventParams={{ from, to: tool.slug }}>
      {body}
    </TrackedLink>
  ) : (
    <Link href={toolPath(tool)} className={className}>
      {body}
    </Link>
  );
}
