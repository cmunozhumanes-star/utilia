"use client";

import { useEffect, useMemo, useState } from "react";
import { DateField, ResultPanel, ToolForm, todayIso, useToolEvents } from "./ui";
import { businessDaysBetween, daysBetween, parseIsoDate } from "@/lib/tools/calc/dates";
import { formatNumberEs } from "@/lib/format/number";

export default function DiasEntreFechasTool() {
  const ev = useToolEvents("dias-entre-fechas");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  useEffect(() => {
    const t = todayIso();
    setFrom(t);
    setTo(t);
  }, []);

  const result = useMemo(() => {
    const a = parseIsoDate(from);
    const b = parseIsoDate(to);
    if (!a || !b) return null;
    const days = Math.abs(daysBetween(a, b));
    return { days, weeks: days / 7, business: businessDaysBetween(a, b), reversed: b < a };
  }, [from, to]);

  useEffect(() => {
    if (result) ev.completed();
  }, [result, ev]);

  const copyText = result
    ? `Días naturales: ${formatNumberEs(result.days, 0)}\nSemanas: ${formatNumberEs(result.weeks, 2)}\nDías laborables: ${formatNumberEs(result.business, 0)}`
    : "";

  return (
    <ToolForm>
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField label="Fecha de inicio" value={from} onChange={(v) => { ev.used(); setFrom(v); }} />
        <DateField label="Fecha de fin" value={to} onChange={(v) => { ev.used(); setTo(v); }} />
      </div>
      <div aria-live="polite">
        {result && (
          <ResultPanel
            tool="dias-entre-fechas"
            copyText={copyText}
            summary={result.reversed ? "La fecha de fin es anterior a la de inicio: se muestra la diferencia en positivo." : undefined}
            rows={[
              { label: "Días naturales", value: formatNumberEs(result.days, 0), primary: true },
              { label: "Semanas", value: formatNumberEs(result.weeks, 2) },
              { label: "Días laborables (lun-vie)", value: formatNumberEs(result.business, 0) },
            ]}
          />
        )}
      </div>
    </ToolForm>
  );
}
