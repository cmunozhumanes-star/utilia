"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { consentConfig as cfg } from "@/lib/consent/config";
import {
  consentCookiesToClear,
  consentSignals,
  needsReload,
  normalizeChoice,
  parseStored,
  planScripts,
  type Choice,
} from "@/lib/consent/logic";

/**
 * Gestor de consentimiento propio. Solo se activa si hay analítica o publicidad configuradas Y válidas:
 * sin ellas el sitio no usa cookies no técnicas y no muestra ningún aviso.
 *
 * - Consent Mode v2: los cuatro señales parten en "denied" y se actualizan según la elección.
 * - Analítica (GTM/GA4) y publicidad (AdSense) son INDEPENDIENTES: cada script se carga solo con SU consentimiento.
 * - Retirar un consentimiento borra las cookies propias de Google y recarga la página para descargar el script.
 *
 * IMPORTANTE (no es una garantía de cumplimiento): este banner NO es una CMP certificada por Google. Para servir
 * anuncios en el EEE/Reino Unido Google exige una CMP certificada (p. ej. "Privacidad y mensajes" de AdSense, que
 * ya está certificada). Por eso la publicidad solo se activa con NEXT_PUBLIC_ADSENSE_CMP_CONFIRMED=true. Ver README.
 */

const KEY = "utilia-consent";

type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; adsbygoogle?: unknown[] };

function read(): Choice | null {
  try {
    return parseStored(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

function write(c: Choice) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* modo privado: la elección solo dura esta visita */
  }
}

function ensureGtag() {
  const w = window as W;
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) {
    w.gtag = function () {
      // gtag exige empujar el objeto `arguments`, no un array.
      // eslint-disable-next-line prefer-rest-params
      (w.dataLayer as unknown[]).push(arguments);
    };
    w.gtag("consent", "default", { ...consentSignals({ analytics: false, ads: false }), wait_for_update: 500 });
  }
  return w.gtag!;
}

function loadScript(src: string, onload?: () => void, crossOrigin = false) {
  const existing = Array.from(document.scripts).find((s) => s.src === src);
  if (existing) {
    onload?.();
    return;
  }
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  if (crossOrigin) s.crossOrigin = "anonymous";
  if (onload) s.onload = onload;
  document.head.appendChild(s);
}

// Cada categoría se inicializa una sola vez por carga de página, aunque se guarde la elección varias veces.
const started = { analytics: false, ads: false };

function apply(c: Choice) {
  const gtag = ensureGtag();
  gtag("consent", "update", consentSignals(c));
  const plan = planScripts(c, cfg);
  if (plan.analytics && !started.analytics) {
    started.analytics = true;
    if (plan.analytics.kind === "gtm") {
      (window as W).dataLayer!.push({ "gtm.start": Date.now(), event: "gtm.js" });
    } else {
      gtag("js", new Date());
      gtag("config", plan.analytics.id);
    }
    loadScript(plan.analytics.src);
  }
  if (plan.ads && !started.ads) {
    started.ads = true;
    loadScript(
      plan.ads.src,
      () => {
        const w = window as W;
        w.adsbygoogle = w.adsbygoogle || [];
        window.dispatchEvent(new Event("utilia:ads-ready"));
      },
      true,
    );
  }
}

/** Borra las cookies propias de Google Analytics / AdSense del dominio (las de terceros las gestiona el navegador). */
function clearCookies(what: { analytics: boolean; ads: boolean }) {
  const names = document.cookie.split(";").map((p) => p.split("=")[0]!.trim()).filter(Boolean);
  const host = window.location.hostname;
  const parts = host.split(".");
  const domains = [undefined, host, `.${host}`, ...(parts.length > 2 ? [`.${parts.slice(-2).join(".")}`] : [])];
  for (const name of consentCookiesToClear(names, what)) {
    for (const d of domains) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ""}`;
  }
}

export function ConsentManager() {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [ads, setAds] = useState(false);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const reopened = useRef(false);
  const enabled = cfg.hasAnalytics || cfg.hasAds;

  useEffect(() => {
    if (!enabled) return;
    const stored = read();
    const saved = stored ? normalizeChoice(stored, cfg) : null;
    if (saved) {
      setAnalytics(saved.analytics);
      setAds(saved.ads);
      apply(saved);
    } else {
      ensureGtag();
      setOpen(true);
    }
    const reopen = () => {
      const c = read();
      setAnalytics(cfg.hasAnalytics && (c?.analytics ?? false));
      setAds(cfg.hasAds && (c?.ads ?? false));
      setCustom(true);
      reopened.current = true;
      setOpen(true);
    };
    window.addEventListener("utilia:open-consent", reopen);
    return () => window.removeEventListener("utilia:open-consent", reopen);
  }, [enabled]);

  // Al reabrir desde el pie de página, el foco pasa al diálogo (teclado y lectores de pantalla).
  useEffect(() => {
    if (open && reopened.current) {
      reopened.current = false;
      titleRef.current?.focus();
    }
  }, [open]);

  const save = useCallback((c: { analytics: boolean; ads: boolean }) => {
    const prev = read();
    const next = normalizeChoice(c, cfg);
    write(next);
    setOpen(false);
    setCustom(false);
    // Retirar un consentimiento ya dado: se borran las cookies de esa categoría y se recarga para descargar el script.
    if (needsReload(prev, next)) {
      clearCookies({ analytics: Boolean(prev?.analytics) && !next.analytics, ads: Boolean(prev?.ads) && !next.ads });
      (window as W).gtag?.("consent", "update", consentSignals(next));
      window.location.reload();
      return;
    }
    apply(next);
  }, []);

  if (!enabled || !open) return null;

  // Aceptar y rechazar comparten estilo: misma prominencia visual. Revisar con asesoría legal.
  const same = "btn btn-primary flex-1 sm:flex-none";
  const secondary = "btn btn-outline flex-1 sm:flex-none";
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="consent-title" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] sm:p-5">
      <div className="wrap">
        <p id="consent-title" ref={titleRef} tabIndex={-1} className="font-medium outline-none">
          Tu privacidad, tu elección
        </p>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Usamos cookies propias y de terceros para {cfg.hasAnalytics && cfg.hasAds ? "medir el uso del sitio y mostrar publicidad" : cfg.hasAnalytics ? "medir el uso del sitio" : "mostrar publicidad"}. Puedes aceptarlas, rechazarlas o elegir cuáles. Más información en la{" "}
          <a href="/cookies/" className="underline">
            política de cookies
          </a>
          .
        </p>
        {custom && (
          <div className="mt-3 grid max-w-3xl gap-2 text-sm">
            <label className="flex items-start gap-2">
              <input type="checkbox" checked disabled className="mt-1" />
              <span>
                <strong>Necesarias.</strong> Guardan tu elección. Siempre activas.
              </span>
            </label>
            {cfg.hasAnalytics && (
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1" />
                <span>
                  <strong>Analítica.</strong> Estadísticas de uso para mejorar las herramientas.
                </span>
              </label>
            )}
            {cfg.hasAds && (
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={ads} onChange={(e) => setAds(e.target.checked)} className="mt-1" />
                <span>
                  <strong>Publicidad.</strong> Anuncios de Google AdSense que financian el sitio.
                </span>
              </label>
            )}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={same} onClick={() => save({ analytics: false, ads: false })}>
            Rechazar todo
          </button>
          {custom ? (
            <button type="button" className={secondary} onClick={() => save({ analytics, ads })}>
              Guardar selección
            </button>
          ) : (
            <button type="button" className={secondary} onClick={() => setCustom(true)}>
              Configurar
            </button>
          )}
          <button type="button" className={same} onClick={() => save({ analytics: cfg.hasAnalytics, ads: cfg.hasAds })}>
            Aceptar todo
          </button>
        </div>
      </div>
    </div>
  );
}

/** Botón del pie de página para reabrir el gestor (cambiar o retirar el consentimiento). Solo aparece si hay cookies no técnicas. */
export function ManageCookiesButton({ className }: { className?: string }) {
  if (!cfg.hasAnalytics && !cfg.hasAds) return null;
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("utilia:open-consent"))}>
      Gestionar cookies
    </button>
  );
}
