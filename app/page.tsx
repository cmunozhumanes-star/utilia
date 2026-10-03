import type { Metadata } from "next";
import Link from "next/link";
import { SearchBox } from "@/components/search/SearchBox";
import { ToolCard } from "@/components/ui/ToolCard";
import { CategoryIcon, CheckIcon } from "@/components/ui/icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/data/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import {
  categoryPath, getAllGuides, getFeaturedTools, getNewTools, getToolsByCategory, getVisibleCategories, guidePath, toolPath,
} from "@/lib/tools/registry";

export const metadata: Metadata = {
  ...buildMetadata({ title: site.name, description: site.heroSubtitle, path: "/" }),
  title: { absolute: `${site.name}: ${site.slogan}` },
};

const h2 = "mb-5 text-2xl font-semibold tracking-tight";

export default function HomePage() {
  const categories = getVisibleCategories();
  const featured = getFeaturedTools(6);
  const fresh = getNewTools(6, featured.map((t) => t.slug));
  const guides = getAllGuides().slice(0, 3);

  return (
    <>
      <section className="wrap pb-12 pt-12 sm:pt-20">
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">{site.heroTitle}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted sm:text-xl">{site.heroSubtitle}</p>
        <div className="mt-8 max-w-2xl">
          <SearchBox variant="hero" />
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          {["Gratis", "Sin registro", "Se ejecuta en tu navegador"].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <CheckIcon className="size-4 text-accent" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="categorias" className="wrap py-10">
        <h2 id="categorias" className={h2}>
          Categorías
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const n = getToolsByCategory(c.slug).length;
            return (
              <Link key={c.slug} href={categoryPath(c.slug)} className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent">
                <CategoryIcon name={c.icon} className="size-6 text-accent" />
                <span className="mt-4 block text-lg font-medium">{c.name}</span>
                <span className="mt-1 block text-sm text-muted">{n} {n === 1 ? "herramienta" : "herramientas"}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="destacadas" className="wrap py-10">
          <h2 id="destacadas" className={h2}>
            Empieza por aquí
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {featured.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>
      )}

      {fresh.length > 0 && (
        <section aria-labelledby="nuevas" className="wrap py-10">
          <h2 id="nuevas" className={h2}>
            Herramientas nuevas
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {fresh.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section aria-labelledby="guias" className="wrap py-10">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 id="guias" className="text-2xl font-semibold tracking-tight">
              Guías
            </h2>
            <Link href="/guias/" className="text-sm text-accent underline underline-offset-4">
              Ver todas
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {guides.map((g) => (
              <Link key={g.slug} href={guidePath(g.slug)} className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent">
                <span className="block font-medium">{g.title}</span>
                <span className="mt-2 block text-sm text-muted">{g.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <JsonLd data={websiteSchema()} />
      <JsonLd data={organizationSchema()} />
    </>
  );
}
