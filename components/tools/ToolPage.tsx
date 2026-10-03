import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolCard } from "@/components/ui/ToolCard";
import { toolComponents } from "@/components/tools/registry";
import { categoryPath, getCategoryOf, getGuide, getRelatedTools, guidePath, toolPath } from "@/lib/tools/registry";
import { faqSchema, webApplicationSchema } from "@/lib/seo/schema";
import type { ToolDefinition } from "@/lib/tools/types";

const h2 = "mt-12 mb-4 text-xl font-semibold tracking-tight";

export function ToolPage({ tool }: { tool: ToolDefinition }) {
  const Tool = toolComponents[tool.slug];
  if (!Tool) throw new Error(`Falta el componente de la herramienta "${tool.slug}" en components/tools/registry.ts`);

  const category = getCategoryOf(tool);
  const related = getRelatedTools(tool);
  const guide = tool.guide ? getGuide(tool.guide) : undefined;
  const [firstIntro, ...moreIntro] = tool.intro;

  return (
    <div className="wrap py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { name: "Herramientas", path: "/herramientas/" },
          { name: category.name, path: categoryPath(category.slug) },
          { name: tool.name, path: toolPath(tool) },
        ]}
      />
      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_18.5rem] lg:gap-14">
        <article>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{tool.name}</h1>
          <p className="mt-3 max-w-[68ch] text-lg text-muted">{firstIntro}</p>

          <section aria-label={tool.name} className="panel mt-6 p-4 sm:p-6">
            <Tool />
          </section>
          {tool.runsInBrowser && (
            <p className="mt-3 text-sm text-muted">Los datos que escribes se procesan en tu navegador. No se envían a ningún servidor.</p>
          )}

          <AdSlot position="tool-below" />

          <div className="prose-utilia">
            <h2>Cómo usar esta herramienta</h2>
            {moreIntro.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <ol>
              {tool.howTo.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>

            {tool.formula && (
              <>
                <h2>Fórmula utilizada</h2>
                <p>
                  <strong className="num font-medium">{tool.formula.expression}</strong>
                </p>
                <p>{tool.formula.notes}</p>
              </>
            )}

            <h2>Ejemplos</h2>
            <ul>
              {tool.examples.map((e) => (
                <li key={e.title}>
                  <strong>{e.title}.</strong> {e.text}
                </li>
              ))}
            </ul>
          </div>

          <AdSlot position="content-middle" />

          <section aria-labelledby="faq">
            <h2 id="faq" className={h2}>
              Preguntas frecuentes
            </h2>
            <div className="divide-y divide-border rounded-xl border border-border bg-surface">
              {tool.faqs.map((f) => (
                <details key={f.q} className="group p-4">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden="true" className="mt-0.5 text-muted transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 max-w-[68ch] leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {guide && (
            <section aria-labelledby="guia">
              <h2 id="guia" className={h2}>
                Guía relacionada
              </h2>
              <Link href={guidePath(guide.slug)} className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent">
                <span className="block font-medium">{guide.title}</span>
                <span className="mt-1 block text-sm text-muted">{guide.description}</span>
              </Link>
            </section>
          )}

          {related.length > 0 && (
            <section aria-labelledby="relacionadas">
              <h2 id="relacionadas" className={h2}>
                Herramientas relacionadas
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {related.map((r) => (
                  <ToolCard key={r.slug} tool={r} from={tool.slug} />
                ))}
              </div>
            </section>
          )}

          <section className="panel mt-12 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">¿Necesitas otra herramienta?</p>
              <p className="text-sm text-muted">Explora más {category.name.toLowerCase()} o busca por lo que quieres hacer.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={categoryPath(category.slug)} className="btn btn-primary">
                Ver {category.name.toLowerCase()}
              </Link>
              <Link href="/herramientas/" className="btn btn-outline">
                Todas las herramientas
              </Link>
            </div>
          </section>
        </article>

        <aside aria-label="Más herramientas" className="mt-12 lg:mt-0">
          {related.length > 0 && (
            <nav aria-label="Más herramientas" className="rounded-xl border border-border bg-surface p-4">
              <p className="mb-2 font-medium">Más en {category.name}</p>
              <ul className="space-y-1 text-sm">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={toolPath(r)} className="block rounded-md py-1.5 text-muted transition-colors hover:text-text">
                      {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <AdSlot position="sidebar" />
        </aside>
      </div>

      <JsonLd data={webApplicationSchema(tool, toolPath(tool))} />
      <JsonLd data={faqSchema(tool.faqs)} />
    </div>
  );
}
