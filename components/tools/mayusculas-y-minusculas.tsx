"use client";

import { useEffect, useMemo, useState } from "react";
import { ChoiceGroup, ResultPanel, TextArea, ToolForm, useToolEvents } from "./ui";
import { changeCase, type CaseMode } from "@/lib/tools/calc/text";

export default function MayusculasYMinusculasTool() {
  const ev = useToolEvents("mayusculas-y-minusculas");
  const [text, setText] = useState("");
  const [mode, setMode] = useState<CaseMode>("sentence");
  const out = useMemo(() => changeCase(text, mode), [text, mode]);

  useEffect(() => {
    if (text.trim()) ev.completed();
  }, [text, ev]);

  return (
    <ToolForm>
      <TextArea label="Tu texto" value={text} onChange={(v) => { ev.used(); setText(v); }} placeholder="Escribe o pega aquí tu texto…" />
      <ChoiceGroup<CaseMode>
        legend="Formato"
        value={mode}
        options={[
          { value: "upper", label: "MAYÚSCULAS" },
          { value: "lower", label: "minúsculas" },
          { value: "sentence", label: "Tipo frase" },
          { value: "title", label: "Tipo Título" },
        ]}
        onChange={(v) => { ev.used(); setMode(v); }}
      />
      <div aria-live="polite">
        {text.trim() && (
          <ResultPanel tool="mayusculas-y-minusculas" copyText={out} rows={[{ label: "Resultado", value: out, primary: true, text: true }]} />
        )}
      </div>
    </ToolForm>
  );
}
