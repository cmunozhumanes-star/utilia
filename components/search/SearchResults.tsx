"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { search, type SearchEntry } from "@/lib/search/score";
import { loadSearchIndex, TYPE_LABEL } from "@/lib/search/client";

export function SearchResults() {
  const q = (useSearchParams().get("q") ?? "").slice(0, 100);
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadSearchIndex().then(setEntries).catch(() => setFailed(true));
  }, []);

  const results = useMemo(() => (entries ? search(entries, q, 20) : []), [entries, q]);

  if (!q.trim()) {
    return <p className="text-muted">Escribe arriba lo que necesitas, por ejemplo «calcular IVA».</p>;
  }
  if (failed) return <p role="alert" className="text-danger">No se pudo cargar el buscador. Recarga la página o <Link href="/herramientas/" className="underline">explora las herramientas</Link>.</p>;
  if (!entries) return <p className="text-muted" role="status">Buscando…</p>;
  if (results.length === 0) {
    return (
      <p role="status" className="text-muted">
        No hay resultados para «{q}». Prueba con otras palabras o{" "}
        <Link href="/herramientas/" className="text-accent underline underline-offset-2">explora todas las herramientas</Link>.
      </p>
    );
  }
  return (
    <>
      <p role="status" className="mb-4 text-sm text-muted">
        {results.length} {results.length === 1 ? "resultado" : "resultados"} para «{q}»
      </p>
      <ul className="grid gap-3">
        {results.map((r) => (
          <li key={r.url}>
            <Link href={r.url} className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent">
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-medium">{r.title}</span>
                <span className="shrink-0 text-xs text-muted">{TYPE_LABEL[r.type]}</span>
              </span>
              <span className="mt-1 block text-sm text-muted">{r.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
