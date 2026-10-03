import { AdUnit } from "@/components/ads/AdUnit";
import { consentConfig } from "@/lib/consent/config";
import { isValidAdSlot } from "@/lib/consent/logic";

export type AdPosition = "tool-below" | "content-middle" | "sidebar" | "content-end";

// Las variables NEXT_PUBLIC_* deben referenciarse de forma literal para que Next las incruste en el build.
const SLOTS: Record<AdPosition, string | undefined> = {
  "tool-below": process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL_BELOW,
  "content-middle": process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT_MIDDLE,
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
  "content-end": process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT_END,
};
const MIN_HEIGHT: Record<AdPosition, number> = { "tool-below": 100, "content-middle": 250, sidebar: 250, "content-end": 100 };

/**
 * Punto de inserción publicitaria. Devuelve null (sin anuncio, sin espacio reservado, sin scripts) salvo que la
 * monetización esté habilitada (ID de editor válido + CMP confirmada + datos legales completos, ver lib/consent/logic.ts)
 * y el ID de bloque sea numérico. Mismo criterio que usan ConsentManager y la CSP.
 */
export function AdSlot({ position }: { position: AdPosition }) {
  const client = consentConfig.adsClient;
  const slot = SLOTS[position];
  if (!client || !isValidAdSlot(slot)) return null;
  return <AdUnit client={client} slot={slot} minHeight={MIN_HEIGHT[position]} />;
}
