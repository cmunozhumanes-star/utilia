"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, ResultPanel, ToolForm, useToolEvents } from "./ui";
import { BMI_LABELS, bmi, bmiCategory } from "@/lib/tools/calc/bmi";
import { formatNumberEs, parseNumberEs } from "@/lib/format/number";

export default function ImcTool() {
  const ev = useToolEvents("imc");
  const [w, setW] = useState("");
  const [h, setH] = useState("");
  const vw = parseNumberEs(w);
  const vh = parseNumberEs(h);
  const errW = w.trim() && (vw === null || vw <= 0 || vw > 500) ? "Escribe un peso entre 1 y 500 kg." : null;
  const errH = h.trim() && (vh === null || vh < 50 || vh > 280) ? "Escribe una altura entre 50 y 280 cm." : null;

  const value = useMemo(() => (vw !== null && vh !== null && !errW && !errH ? bmi(vw, vh) : null), [vw, vh, errW, errH]);

  useEffect(() => {
    if (value !== null) ev.completed();
  }, [value, ev]);

  const cat = value !== null ? BMI_LABELS[bmiCategory(value)] : "";

  return (
    <ToolForm>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Peso" suffix="kg" value={w} onChange={(v) => { ev.used(); setW(v); }} error={errW} />
        <Field label="Altura" suffix="cm" value={h} onChange={(v) => { ev.used(); setH(v); }} error={errH} />
      </div>
      <div aria-live="polite">
        {value !== null && (
          <ResultPanel
            tool="imc"
            summary="Valores orientativos para adultos. No sustituye a una valoración médica."
            copyText={`IMC: ${formatNumberEs(value, 1)} (${cat})`}
            rows={[
              { label: "Tu IMC", value: formatNumberEs(value, 1), primary: true },
              { label: "Categoría OMS", value: cat },
            ]}
          />
        )}
      </div>
    </ToolForm>
  );
}
