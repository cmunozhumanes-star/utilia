"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, ResultPanel, SelectField, ToolForm, useToolEvents } from "./ui";
import { convertLinear, type Unit } from "@/lib/tools/calc/units";
import { formatNumberEs, parseNumberEs } from "@/lib/format/number";

/** Conversor genérico para magnitudes lineales (longitud, masa…). Cada herramienta lo envuelve con sus unidades. */
export function UnitConverter({ slug, units, from: f0, to: t0 }: { slug: string; units: Unit[]; from: string; to: string }) {
  const ev = useToolEvents(slug);
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState(f0);
  const [to, setTo] = useState(t0);
  const n = parseNumberEs(value);
  const error = value.trim() && n === null ? "Escribe un número válido." : null;
  const fu = units.find((u) => u.id === from)!;
  const tu = units.find((u) => u.id === to)!;
  const out = useMemo(() => (n === null ? null : convertLinear(n, fu, tu)), [n, fu, tu]);

  useEffect(() => {
    if (out !== null) ev.completed();
  }, [out, ev]);

  const options = units.map((u) => ({ value: u.id, label: `${u.label} (${u.symbol})` }));
  const text = out !== null && n !== null ? `${formatNumberEs(n, 6)} ${fu.symbol} = ${formatNumberEs(out, 6)} ${tu.symbol}` : "";

  return (
    <ToolForm>
      <Field signed label="Cantidad" value={value} onChange={(v) => { ev.used(); setValue(v); }} error={error} />
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <SelectField label="De" value={from} options={options} onChange={(v) => { ev.used(); setFrom(v); }} />
        <button
          type="button"
          className="btn btn-outline"
          aria-label="Intercambiar unidades"
          onClick={() => {
            ev.used();
            setFrom(to);
            setTo(from);
          }}
        >
          ⇄
        </button>
        <SelectField label="A" value={to} options={options} onChange={(v) => { ev.used(); setTo(v); }} />
      </div>
      <div aria-live="polite">
        {out !== null && <ResultPanel tool={slug} copyText={text} rows={[{ label: `${tu.label}`, value: `${formatNumberEs(out, 6)} ${tu.symbol}`, primary: true }]} />}
      </div>
    </ToolForm>
  );
}
