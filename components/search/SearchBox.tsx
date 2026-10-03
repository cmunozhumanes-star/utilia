"use client";

import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/ui/icons";
import { search, type SearchEntry } from "@/lib/search/score";
import { loadSearchIndex, TYPE_LABEL } from "@/lib/search/client";
import { track } from "@/lib/analytics/events";

export function SearchBox({ variant = "compact", autoFocus = false }: { variant?: "hero" | "compact"; autoFocus?: boolean }) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const results = useMemo(() => (entries ? search(entries, query, 6) : []), [entries, query]);
  const showPanel = open && query.trim().length > 0;

  const ensureIndex = () => {
    if (entries || failed) return;
    loadSearchIndex().then(setEntries).catch(() => setFailed(true));
  };

  const goToResultsPage = () => {
    const q = query.trim().slice(0, 100);
    if (!q) return;
    track("search", { search_term: q, results_count: results.length });
    router.push(`/buscar/?q=${encodeURIComponent(q)}`);
  };

  const submit = () => {
    const chosen = active >= 0 ? results[active] : undefined;
    if (chosen) {
      track("search", { search_term: query.trim().slice(0, 100), results_count: results.length });
      router.push(chosen.url);
    } else goToResultsPage();
    setOpen(false);
  };

  const hero = variant === "hero";

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor={`${id}-input`} className="sr-only">
          Buscar herramientas, categorías y guías
        </label>
        <SearchIcon className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted ${hero ? "size-5" : "size-4"}`} />
        <input
          id={`${id}-input`}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          maxLength={100}
          value={query}
          placeholder={hero ? "¿Qué necesitas calcular, convertir o generar?" : "Buscar herramientas"}
          onFocus={() => {
            ensureIndex();
            setOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
            setOpen(true);
            ensureIndex();
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && results.length) {
              e.preventDefault();
              setActive((a) => (a + 1) % results.length);
            } else if (e.key === "ArrowUp" && results.length) {
              e.preventDefault();
              setActive((a) => (a <= 0 ? results.length - 1 : a - 1));
            } else if (e.key === "Escape") {
              setOpen(false);
              setActive(-1);
            }
          }}
          className={`input pl-10 ${hero ? "min-h-14 text-lg" : ""}`}
        />
      </form>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          {results.length > 0 ? (
            <ul id={listId} role="listbox" aria-label="Resultados">
              {results.map((r, i) => (
                <li key={r.url} id={`${id}-opt-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={r.url}
                    tabIndex={-1}
                    onClick={() => {
                      track("search", { search_term: query.trim().slice(0, 100), results_count: results.length });
                      setOpen(false);
                    }}
                    className={`flex items-baseline justify-between gap-3 px-4 py-3 ${i === active ? "bg-soft" : "hover:bg-soft"}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{r.title}</span>
                      <span className="block truncate text-sm text-muted">{r.summary}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">{TYPE_LABEL[r.type]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p id={listId} role="status" className="px-4 py-3 text-sm text-muted">
              {failed
                ? "No se pudo cargar el buscador. "
                : entries
                  ? `No hay resultados para «${query.trim()}». Prueba con otras palabras o `
                  : "Buscando… "}
              {(failed || entries) && (
                <Link href="/herramientas/" className="text-accent underline underline-offset-2">
                  explora todas las herramientas
                </Link>
              )}
              {(failed || entries) && "."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
