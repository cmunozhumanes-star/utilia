import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchBox } from "@/components/search/SearchBox";
import { SearchResults } from "@/components/search/SearchResults";
import { buildMetadata } from "@/lib/seo/metadata";

// Las páginas de resultados internos no deben indexarse (evita contenido duplicado y thin content).
export const metadata: Metadata = buildMetadata({
  title: "Buscar herramientas",
  description: "Busca calculadoras, conversores, guías y utilidades online gratuitas.",
  path: "/buscar/",
  noindex: true,
});

export default function SearchPage() {
  return (
    <div className="wrap py-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Buscar</h1>
      <div className="mt-6 max-w-2xl">
        <SearchBox variant="hero" autoFocus />
      </div>
      <div className="mt-8 max-w-2xl">
        <Suspense fallback={<p className="text-muted">Cargando…</p>}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
