import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPage } from "@/components/tools/ToolPage";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAllTools, getTool, toolPath } from "@/lib/tools/registry";

export const dynamicParams = false;
type Props = { params: Promise<{ categoria: string; herramienta: string }> };

export function generateStaticParams() {
  return getAllTools().map((t) => ({ categoria: t.category, herramienta: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria, herramienta } = await params;
  const t = getTool(categoria, herramienta);
  if (!t) return {};
  return buildMetadata({ title: t.title, description: t.description, path: toolPath(t), type: "article", publishedTime: t.publishedAt, modifiedTime: t.updatedAt });
}

export default async function Page({ params }: Props) {
  const { categoria, herramienta } = await params;
  const t = getTool(categoria, herramienta);
  if (!t) notFound();
  return <ToolPage tool={t} />;
}
