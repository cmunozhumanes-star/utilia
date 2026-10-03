"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, ResultPanel, SelectField, ToolForm, useToolEvents } from "./ui";
import { convertTemperature, type TempUnit } from "@/lib/tools/calc/units";
import { formatNumberEs, parseNumberEs } from "@/lib/format/number";

const OPTIONS: { value: TempUnit; label: string }[] = [
  { value: "c", label: "Celsius (°C)" },
  { value: "f", label: "Fahrenheit (°F)" },
  { value: "k", label: "Kelvin (K)" },
];
const SYMBOL: Record<TempUnit, string> = { c: "°C", f: "°F", k: "K" };

export default function TemperaturaTool() {
  const ev = useToolEvents("temperatura");
  const [value, setValue] = useState("100");
  const [from, setFrom] = useState<TempUnit>("c");
  const [to, setTo] = useState<TempUnit>("f");
  const n = parseNumberEs(value);
  const out = useMemo(() => (n === null ? null : convertTemperature(n, from, to)), [n, from, to]);
  const error = value.trim() && n === null ? "Escribe un número válido." : n !== null && out === null ? "Esa temperatura está por debajo del cero absoluto." : null;

  useEffect(() => {
    if (out !== null) ev.completed();
  }, [out, ev]);

  const text = out !== null && n !== null ? `${formatNumberEs(n, 4)} ${SYMBOL[from]} = ${formatNumberEs(out, 4)} ${SYMBOL[to]}` : "";

  return (
    <ToolForm>
      <Field signed label="Temperatura" value={value} onChange={(v) => { ev.used(); setValue(v); }} error={error} />
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <SelectField label="De" value={from} options={OPTIONS} onChange={(v) => { ev.used(); setFrom(v); }} />
        <button type="button" className="btn btn-outline" aria-label="Intercambiar escalas" onClick={() => { ev.used(); setFrom(to); setTo(from); }}>
          ⇄
        </button>
        <SelectField label="A" value={to} options={OPTIONS} onChange={(v) => { ev.used(); setTo(v); }} />
      </div>
      <div aria-live="polite">
        {out !== null && <ResultPanel tool="temperatura" copyText={text} rows={[{ label: "Resultado", value: `${formatNumberEs(out, 4)} ${SYMBOL[to]}`, primary: true }]} />}
      </div>
    </ToolForm>
  );
}
