import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolCard } from "@/components/ui/ToolCard";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/schema";
import { getAllGuides, getGuide, getToolBySlug, guidePath } from "@/lib/tools/registry";
import type { ToolDefinition } from "@/lib/tools/types";

export const dynamicParams = false;
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  return buildMetadata({ title: g.title, description: g.description, path: guidePath(g.slug), type: "article", publishedTime: g.publishedAt, modifiedTime: g.updatedAt });
}

export default async function GuidePage({ params }: Props) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const tools = g.relatedTools.map(getToolBySlug).filter((t): t is ToolDefinition => Boolean(t));
  const mid = Math.ceil(g.sections.length / 2);

  return (
    <div className="wrap py-8">
      <Breadcrumbs items={[{ name: "Guías", path: "/guias/" }, { name: g.title, path: guidePath(g.slug) }]} />
      <article className="mt-6">
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{g.title}</h1>
        <p className="mt-3 max-w-[68ch] text-lg text-muted">{g.intro}</p>
        <p className="mt-2 text-sm text-muted">
          Actualizada el <time dateTime={g.updatedAt}>{new Date(g.updatedAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time>
        </p>

        {tools.length > 0 && (
          <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
            {tools.map((t) => (
              <ToolCard key={t.slug} tool={t} from={`guia:${g.slug}`} />
            ))}
          </div>
        )}

        <div className="prose-utilia">
          {g.sections.map((s, i) => (
            <section key={s.h2}>
              <h2>{s.h2}</h2>
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {s.list && (
                <ul>
                  {s.list.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              )}
              {i === mid - 1 && <AdSlot position="content-middle" />}
            </section>
          ))}
        </div>
        <AdSlot position="content-end" />
      </article>
      <JsonLd data={articleSchema(g, guidePath(g.slug))} />
    </div>
  );
}
