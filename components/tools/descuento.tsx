"use client";

import { useEffect, useMemo, useState } from "react";
import { ChoiceGroup, Field, ResultPanel, ToolForm, useToolEvents } from "./ui";
import { computeDiscount } from "@/lib/tools/calc/discount";
import { formatEur, formatNumberEs, parseNumberEs } from "@/lib/format/number";

type Mode = "final" | "percent" | "original";
const LIMIT = 1e12;

export default function DescuentoTool() {
  const ev = useToolEvents("descuento");
  const [mode, setMode] = useState<Mode>("final");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const va = parseNumberEs(a);
  const vb = parseNumberEs(b);
  const errA = a.trim() && va === null ? "Escribe un número válido." : null;
  const errB = b.trim() && vb === null ? "Escribe un número válido." : null;

  const outcome = useMemo(() => {
    if (va === null || vb === null) return null;
    if (Math.abs(va) > LIMIT || Math.abs(vb) > LIMIT) return { ok: false, error: "El número es demasiado grande." } as const;
    return computeDiscount(mode, va, vb);
  }, [mode, va, vb]);
  const result = outcome?.ok ? outcome.result : null;

  useEffect(() => {
    if (result) ev.completed();
  }, [result, ev]);

  const labels: Record<Mode, [string, string, string, string]> = {
    final: ["Precio original", "€", "Descuento", "%"],
    percent: ["Precio original", "€", "Precio con descuento", "€"],
    original: ["Precio con descuento", "€", "Descuento aplicado", "%"],
  };
  const [la, sa, lb, sb] = labels[mode];
  const pct = result ? formatNumberEs(result.percent, 2) : "";
  const copyText = result
    ? `Precio original: ${formatEur(result.original)}\nDescuento (${pct} %): ${formatEur(result.discount)}\nPrecio final: ${formatEur(result.final)}`
    : "";

  return (
    <ToolForm>
      <ChoiceGroup<Mode>
        legend="Qué quieres calcular"
        value={mode}
        options={[
          { value: "final", label: "Precio final" },
          { value: "percent", label: "% de descuento" },
          { value: "original", label: "Precio original" },
        ]}
        onChange={(v) => {
          ev.used();
          setMode(v);
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={la} suffix={sa} value={a} onChange={(v) => { ev.used(); setA(v); }} error={errA} />
        <Field label={lb} suffix={sb} value={b} onChange={(v) => { ev.used(); setB(v); }} error={errB} />
      </div>
      <div aria-live="polite">
        {outcome && !outcome.ok && (
          <p role="alert" className="text-sm text-danger">
            {outcome.error}
          </p>
        )}
        {result && (
          <ResultPanel
            tool="descuento"
            copyText={copyText}
            rows={[
              mode === "percent"
                ? { label: "Descuento", value: `${pct} %`, primary: true }
                : mode === "original"
                  ? { label: "Precio original", value: formatEur(result.original), primary: true }
                  : { label: "Precio final", value: formatEur(result.final), primary: true },
              { label: "Ahorro", value: formatEur(result.discount) },
              ...(mode === "final" ? [] : [{ label: "Precio final", value: formatEur(result.final) }]),
            ]}
          />
        )}
      </div>
    </ToolForm>
  );
}
