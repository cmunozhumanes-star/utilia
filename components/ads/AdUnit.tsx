"use client";

import { useEffect, useRef, useState } from "react";

type W = Window & { adsbygoogle?: unknown[] };

/**
 * Renderiza un bloque de AdSense SOLO cuando el script de AdSense está cargado (lo hace el gestor de
 * consentimiento de la Fase 8 y emite "utilia:ads-ready"). Sin consentimiento no se renderiza nada:
 * ni huecos vacíos ni peticiones a Google.
 */
export function AdUnit({ client, slot, minHeight }: { client: string; slot: string; minHeight: number }) {
  const [ready, setReady] = useState(false);
  const pushed = useRef(false);

  useEffect(() => {
    const check = () => {
      if ((window as W).adsbygoogle) setReady(true);
    };
    check();
    window.addEventListener("utilia:ads-ready", check);
    return () => window.removeEventListener("utilia:ads-ready", check);
  }, []);

  useEffect(() => {
    if (!ready || pushed.current) return;
    pushed.current = true;
    try {
      ((window as W).adsbygoogle ||= []).push({});
    } catch {
      /* un bloqueador de anuncios puede romper el push: no afecta a la herramienta */
    }
  }, [ready]);

  if (!ready) return null;
  return (
    <aside aria-label="Publicidad" className="my-8">
      <p className="mb-1 text-xs text-muted">Publicidad</p>
      <div style={{ minHeight }} className="overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
