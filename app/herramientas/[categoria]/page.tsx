import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ToolCard } from "@/components/ui/ToolCard";
import { buildMetadata } from "@/lib/seo/metadata";
import { categoryPath, getCategory, getToolsByCategory, getVisibleCategories } from "@/lib/tools/registry";

export const dynamicParams = false;
type Props = { params: Promise<{ categoria: string }> };

export function generateStaticParams() {
  return getVisibleCategories().map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCategory((await params).categoria);
  if (!c) return {};
  return buildMetadata({ title: c.title, description: c.description, path: categoryPath(c.slug) });
}

export default async function CategoryPage({ params }: Props) {
  const c = getCategory((await params).categoria);
  if (!c) notFound();
  const list = getToolsByCategory(c.slug);
  return (
    <div className="wrap py-8">
      <Breadcrumbs items={[{ name: "Herramientas", path: "/herramientas/" }, { name: c.name, path: categoryPath(c.slug) }]} />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">{c.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{c.intro}</p>
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {list.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
    </div>
  );
}
