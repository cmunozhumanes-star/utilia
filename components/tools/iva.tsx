"use client";

import { useEffect, useMemo, useState } from "react";
import { ChoiceGroup, Field, ResultPanel, ToolForm, useToolEvents } from "./ui";
import { addVat, removeVat, IVA_RATES } from "@/lib/tools/calc/iva";
import { formatEur, formatNumberEs, parseNumberEs } from "@/lib/format/number";

type Mode = "add" | "remove";
const LIMIT = 1e12;

export default function IvaTool() {
  const ev = useToolEvents("iva");
  const [mode, setMode] = useState<Mode>("add");
  const [rateChoice, setRateChoice] = useState<string>("21");
  const [custom, setCustom] = useState("");
  const [amount, setAmount] = useState("");

  const customRate = parseNumberEs(custom);
  const rate = rateChoice === "custom" ? customRate : Number(rateChoice);
  const rateError =
    rateChoice === "custom" && custom.trim() && (customRate === null || customRate < 0 || customRate > 100)
      ? "Escribe un tipo entre 0 y 100."
      : null;
  const value = parseNumberEs(amount);
  const amountError = amount.trim() && value === null ? "Escribe un importe válido, por ejemplo 1.250,50." : null;
  const tooBig = value !== null && Math.abs(value) > LIMIT;

  const result = useMemo(() => {
    if (value === null || tooBig || rate === null || rateError || rate < 0 || rate > 100) return null;
    return mode === "add" ? addVat(value, rate) : removeVat(value, rate);
  }, [mode, value, rate, rateError, tooBig]);

  useEffect(() => {
    if (result) ev.completed();
  }, [result, ev]);

  const run = (fn: () => void) => {
    ev.used();
    fn();
  };

  const rateLabel = result ? formatNumberEs(result.rate, 2) : "";
  const copyText = result
    ? `Base imponible: ${formatEur(result.base)}\nIVA (${rateLabel} %): ${formatEur(result.vat)}\nTotal: ${formatEur(result.total)}`
    : "";

  return (
    <ToolForm>
      <ChoiceGroup<Mode>
        legend="Qué quieres hacer"
        value={mode}
        options={[
          { value: "add", label: "Añadir IVA" },
          { value: "remove", label: "Quitar IVA" },
        ]}
        onChange={(v) => run(() => setMode(v))}
      />
      <ChoiceGroup<string>
        legend="Tipo de IVA"
        value={rateChoice}
        options={[...IVA_RATES.map((r) => ({ value: String(r), label: `${r} %` })), { value: "custom", label: "Otro" }]}
        onChange={(v) => run(() => setRateChoice(v))}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {rateChoice === "custom" && (
          <Field label="Tu tipo de IVA" suffix="%" value={custom} onChange={(v) => run(() => setCustom(v))} error={rateError} />
        )}
        <Field
          label={mode === "add" ? "Base imponible (sin IVA)" : "Total (con IVA incluido)"}
          suffix="€"
          value={amount}
          onChange={(v) => run(() => setAmount(v))}
          error={amountError ?? (tooBig ? "El importe es demasiado grande." : null)}
        />
      </div>
      <div aria-live="polite">
        {result && (
          <ResultPanel
            tool="iva"
            copyText={copyText}
            rows={[
              { label: mode === "add" ? "Total con IVA" : "Base imponible", value: formatEur(mode === "add" ? result.total : result.base), primary: true },
              ...(mode === "add"
                ? [{ label: "Base imponible", value: formatEur(result.base) }]
                : [{ label: "Total con IVA", value: formatEur(result.total) }]),
              { label: `IVA (${rateLabel} %)`, value: formatEur(result.vat) },
            ]}
          />
        )}
      </div>
    </ToolForm>
  );
}
