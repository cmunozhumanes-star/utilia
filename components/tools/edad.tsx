"use client";

import { useEffect, useMemo, useState } from "react";
import { DateField, ResultPanel, ToolForm, todayIso, useToolEvents } from "./ui";
import { ageBetween, parseIsoDate } from "@/lib/tools/calc/dates";
import { formatNumberEs } from "@/lib/format/number";

export default function EdadTool() {
  const ev = useToolEvents("edad");
  const [birth, setBirth] = useState("");
  const [ref, setRef] = useState("");
  useEffect(() => setRef(todayIso()), []);

  const b = parseIsoDate(birth);
  const r = parseIsoDate(ref);
  const age = useMemo(() => (b && r ? ageBetween(b, r) : null), [b, r]);
  const error = b && r && !age ? "La fecha de nacimiento no puede ser posterior a la de referencia." : null;

  useEffect(() => {
    if (age) ev.completed();
  }, [age, ev]);

  const plural = (n: number, one: string, many: string) => `${formatNumberEs(n, 0)} ${n === 1 ? one : many}`;
  const text = age ? `${plural(age.years, "año", "años")}, ${plural(age.months, "mes", "meses")} y ${plural(age.days, "día", "días")}` : "";

  return (
    <ToolForm>
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField label="Fecha de nacimiento" value={birth} onChange={(v) => { ev.used(); setBirth(v); }} error={error} />
        <DateField label="Calcular la edad a fecha de" value={ref} onChange={(v) => { ev.used(); setRef(v); }} />
      </div>
      <div aria-live="polite">
        {age && (
          <ResultPanel
            tool="edad"
            copyText={`Edad: ${text} (${formatNumberEs(age.totalDays, 0)} días)`}
            rows={[
              { label: "Edad exacta", value: text, primary: true },
              { label: "Días vividos", value: formatNumberEs(age.totalDays, 0) },
            ]}
          />
        )}
      </div>
    </ToolForm>
  );
}
