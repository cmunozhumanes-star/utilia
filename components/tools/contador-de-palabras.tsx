"use client";

import { useEffect, useMemo, useState } from "react";
import { TextArea, ToolForm, useToolEvents } from "./ui";
import { textStats } from "@/lib/tools/calc/text";
import { formatNumberEs } from "@/lib/format/number";

export default function ContadorDePalabrasTool() {
  const ev = useToolEvents("contador-de-palabras");
  const [text, setText] = useState("");
  const s = useMemo(() => textStats(text), [text]);

  useEffect(() => {
    if (s.words > 0) ev.completed();
  }, [s.words, ev]);

  const minutes = s.readingMinutes < 1 ? "menos de 1 min" : `${formatNumberEs(Math.ceil(s.readingMinutes), 0)} min`;
  const items: [string, string][] = [
    ["Palabras", formatNumberEs(s.words, 0)],
    ["Caracteres", formatNumberEs(s.characters, 0)],
    ["Sin espacios", formatNumberEs(s.charactersNoSpaces, 0)],
    ["Frases", formatNumberEs(s.sentences, 0)],
    ["Párrafos", formatNumberEs(s.paragraphs, 0)],
    ["Lectura", s.words === 0 ? "0 min" : minutes],
  ];

  return (
    <ToolForm>
      <TextArea label="Tu texto" value={text} onChange={(v) => { ev.used(); setText(v); }} placeholder="Escribe o pega aquí tu texto…" />
      <dl aria-live="polite" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map(([k, v]) => (
          <div key={k} className="rounded-lg bg-soft p-3">
            <dt className="text-sm text-muted">{k}</dt>
            <dd className="num text-2xl font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <div>
        <button type="button" className="btn btn-outline" onClick={() => setText("")} disabled={!text}>
          Borrar
        </button>
      </div>
    </ToolForm>
  );
}
