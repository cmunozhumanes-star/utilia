import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ToolCard } from "@/components/ui/ToolCard";
import { CategoryIcon } from "@/components/ui/icons";
import { buildMetadata } from "@/lib/seo/metadata";
import { categoryPath, getToolsByCategory, getVisibleCategories } from "@/lib/tools/registry";

export const metadata: Metadata = buildMetadata({
  title: "Todas las herramientas online gratuitas",
  description: "Calculadoras, conversores y utilidades online gratuitas, organizadas por categorías. Sin registro y con resultados al instante.",
  path: "/herramientas/",
});

export default function ToolsHub() {
  const categories = getVisibleCategories();
  return (
    <div className="wrap py-8">
      <Breadcrumbs items={[{ name: "Herramientas", path: "/herramientas/" }]} />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Todas las herramientas</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">Elige una categoría o usa el buscador de arriba para ir directo a lo que necesitas.</p>

      <div id="categorias" className="mt-10 space-y-12">
        {categories.map((c) => (
          <section key={c.slug} aria-labelledby={`cat-${c.slug}`}>
            <div className="mb-4 flex items-center gap-3">
              <CategoryIcon name={c.icon} className="size-6 text-accent" />
              <h2 id={`cat-${c.slug}`} className="text-xl font-semibold tracking-tight">
                <Link href={categoryPath(c.slug)} className="hover:underline">{c.name}</Link>
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {getToolsByCategory(c.slug).map((t) => (
                <ToolCard key={t.slug} tool={t} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
