import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getLegalPage, legalPages } from "@/data/legal";
import { site } from "@/data/site";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;
type Props = { params: Promise<{ pagina: string }> };

export function generateStaticParams() {
  return legalPages.map((p) => ({ pagina: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getLegalPage((await params).pagina);
  if (!p) return {};
  // Con placeholders sin rellenar la página no debe indexarse.
  return buildMetadata({ title: p.title, description: p.description, path: `/${p.slug}/`, noindex: !site.legalCompleted });
}

/** Resalta los [COMPLETAR: ...] para que sea imposible olvidarlos. */
function Text({ children }: { children: string }) {
  return (
    <>
      {children.split(/(\[COMPLETAR:[^\]]+\])/g).map((part, i) =>
        part.startsWith("[COMPLETAR:") ? (
          <mark key={i} className="placeholder">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

export default async function LegalPage({ params }: Props) {
  const p = getLegalPage((await params).pagina);
  if (!p) notFound();
  return (
    <div className="wrap py-8">
      <Breadcrumbs items={[{ name: p.title, path: `/${p.slug}/` }]} />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">{p.title}</h1>
      {!site.legalCompleted && (
        <p role="note" className="mt-4 max-w-[68ch] rounded-lg border border-border bg-soft p-3 text-sm">
          Borrador: completa los campos resaltados y revisa el texto con un profesional antes de publicar. Mientras tanto esta página no se indexa.
        </p>
      )}
      <div className="prose-utilia mt-4">
        <p className="text-lg text-muted">
          <Text>{p.intro}</Text>
        </p>
        {p.sections.map((s) => (
          <section key={s.h2}>
            <h2>{s.h2}</h2>
            {s.body.map((b) => (
              <p key={b}>
                <Text>{b}</Text>
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
