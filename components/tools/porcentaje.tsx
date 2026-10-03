"use client";

import { useEffect, useMemo, useState } from "react";
import { ChoiceGroup, Field, ResultPanel, ToolForm, useToolEvents } from "./ui";
import { computePercentage, type PercentageMode } from "@/lib/tools/calc/percentage";
import { formatNumberEs, parseNumberEs } from "@/lib/format/number";

type ModeDef = {
  value: PercentageMode;
  label: string;
  a: { label: string; suffix?: string };
  b: { label: string; suffix?: string };
  sentence: (a: string, b: string, r: string) => string;
};

const MODES: ModeDef[] = [
  { value: "of", label: "X % de una cantidad", a: { label: "Porcentaje", suffix: "%" }, b: { label: "Cantidad" }, sentence: (a, b, r) => `El ${a} % de ${b} es ${r}.` },
  { value: "what", label: "Qué % es una parte", a: { label: "Parte" }, b: { label: "Total" }, sentence: (a, b, r) => `${a} es el ${r} % de ${b}.` },
  { value: "increase", label: "Aumentar un %", a: { label: "Cantidad" }, b: { label: "Porcentaje", suffix: "%" }, sentence: (a, b, r) => `${a} aumentado un ${b} % es ${r}.` },
  { value: "decrease", label: "Disminuir un %", a: { label: "Cantidad" }, b: { label: "Porcentaje", suffix: "%" }, sentence: (a, b, r) => `${a} disminuido un ${b} % es ${r}.` },
  { value: "variation", label: "Variación entre dos valores", a: { label: "Valor inicial" }, b: { label: "Valor final" }, sentence: (a, b, r) => `De ${a} a ${b} hay una variación del ${r} %.` },
];

const INVALID = "Escribe un número válido, por ejemplo 12,5.";
const LIMIT = 1e15;

export default function PorcentajeTool() {
  const ev = useToolEvents("porcentaje");
  const [mode, setMode] = useState<PercentageMode>("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const def = MODES.find((m) => m.value === mode)!;

  const pa = parseNumberEs(a);
  const pb = parseNumberEs(b);
  const errA = a.trim() && pa === null ? INVALID : null;
  const errB = b.trim() && pb === null ? INVALID : null;

  const outcome = useMemo(() => {
    if (pa === null || pb === null) return null;
    const r = computePercentage(mode, pa, pb);
    if (!r.ok) return { error: r.error } as const;
    if (!Number.isFinite(r.value) || Math.abs(r.value) > LIMIT) return { error: "El número es demasiado grande." } as const;
    return { value: r.value, kind: r.kind } as const;
  }, [mode, pa, pb]);

  const done = outcome && "value" in outcome;
  useEffect(() => {
    if (done) ev.completed();
  }, [done, ev]);

  const run = (fn: () => void) => {
    ev.used();
    fn();
  };

  let panel = null;
  if (outcome && "error" in outcome) {
    panel = (
      <p role="alert" className="text-sm text-danger">
        {outcome.error}
      </p>
    );
  } else if (outcome && "value" in outcome && pa !== null && pb !== null) {
    const shown = formatNumberEs(outcome.value, outcome.kind === "percent" ? 2 : 4);
    const main = outcome.kind === "percent" ? `${shown} %` : shown;
    const sentence = def.sentence(formatNumberEs(pa, 4), formatNumberEs(pb, 4), shown);
    panel = (
      <ResultPanel
        tool="porcentaje"
        summary={sentence}
        copyText={sentence}
        rows={[{ label: "Resultado", value: main, primary: true }]}
      />
    );
  }

  return (
    <ToolForm>
      <ChoiceGroup legend="Qué quieres calcular" value={mode} options={MODES.map((m) => ({ value: m.value, label: m.label }))} onChange={(v) => run(() => setMode(v))} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field signed label={def.a.label} suffix={def.a.suffix} value={a} onChange={(v) => run(() => setA(v))} error={errA} />
        <Field signed label={def.b.label} suffix={def.b.suffix} value={b} onChange={(v) => run(() => setB(v))} error={errB} />
      </div>
      <div aria-live="polite">{panel}</div>
    </ToolForm>
  );
}
