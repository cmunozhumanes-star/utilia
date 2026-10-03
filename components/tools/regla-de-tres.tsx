"use client";

import { useEffect, useMemo, useState } from "react";
import { ChoiceGroup, Field, ResultPanel, ToolForm, useToolEvents } from "./ui";
import { ruleOfThreeDirect, ruleOfThreeInverse } from "@/lib/tools/calc/rule-of-three";
import { formatNumberEs, parseNumberEs } from "@/lib/format/number";

type Mode = "direct" | "inverse";

export default function ReglaDeTresTool() {
  const ev = useToolEvents("regla-de-tres");
  const [mode, setMode] = useState<Mode>("direct");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [va, vb, vc] = [parseNumberEs(a), parseNumberEs(b), parseNumberEs(c)];
  const bad = (s: string, v: number | null) => (s.trim() && v === null ? "Escribe un número válido." : null);

  const result = useMemo(() => {
    if (va === null || vb === null || vc === null) return null;
    return mode === "direct" ? ruleOfThreeDirect(va, vb, vc) : ruleOfThreeInverse(va, vb, vc);
  }, [mode, va, vb, vc]);

  useEffect(() => {
    if (result?.ok) ev.completed();
  }, [result, ev]);

  const touch = (set: (v: string) => void) => (v: string) => {
    ev.used();
    set(v);
  };

  return (
    <ToolForm>
      <ChoiceGroup<Mode>
        legend="Tipo de proporción"
        value={mode}
        options={[
          { value: "direct", label: "Directa" },
          { value: "inverse", label: "Inversa" },
        ]}
        onChange={(v) => {
          ev.used();
          setMode(v);
        }}
      />
      <p className="text-sm text-muted">Si A es a B, entonces C es a X.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field signed label="A" value={a} onChange={touch(setA)} error={bad(a, va)} />
        <Field signed label="B" value={b} onChange={touch(setB)} error={bad(b, vb)} />
        <Field signed label="C" value={c} onChange={touch(setC)} error={bad(c, vc)} />
      </div>
      <div aria-live="polite">
        {result && !result.ok && (
          <p role="alert" className="text-sm text-danger">
            {result.error}
          </p>
        )}
        {result?.ok && (
          <ResultPanel tool="regla-de-tres" copyText={`X = ${formatNumberEs(result.value, 6)}`} rows={[{ label: "X", value: formatNumberEs(result.value, 6), primary: true }]} />
        )}
      </div>
    </ToolForm>
  );
}
