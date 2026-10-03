"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";
import { track } from "@/lib/analytics/events";

export function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  hint?: string;
  error?: string | null;
  placeholder?: string;
  /** Admite negativos. El teclado numérico de iOS (inputMode="decimal") no tiene "-", así que se usa el de texto. */
  signed?: boolean;
}) {
  const id = useId();
  const describedBy = [props.hint ? `${id}-h` : "", props.error ? `${id}-e` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {props.label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode={props.signed ? "text" : "decimal"}
          autoComplete="off"
          maxLength={24}
          value={props.value}
          placeholder={props.placeholder}
          aria-invalid={Boolean(props.error)}
          aria-describedby={describedBy}
          onChange={(e) => props.onChange(e.target.value)}
          className={`input num ${props.suffix ? "pr-12" : ""}`}
        />
        {props.suffix && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">{props.suffix}</span>}
      </div>
      {props.hint && !props.error && (
        <p id={`${id}-h`} className="mt-1 text-sm text-muted">
          {props.hint}
        </p>
      )}
      {props.error && (
        <p id={`${id}-e`} role="alert" className="mt-1 text-sm text-danger">
          {props.error}
        </p>
      )}
    </div>
  );
}

export function ChoiceGroup<T extends string>(props: {
  legend: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const name = useId();
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{props.legend}</legend>
      <div className="flex flex-wrap gap-2">
        {props.options.map((o) => (
          <label key={o.value} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={props.value === o.value}
              onChange={() => props.onChange(o.value)}
              className="peer sr-only"
            />
            <span className="flex min-h-11 items-center rounded-lg border border-border bg-surface px-3.5 text-sm transition-colors hover:border-accent peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-fg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** `text`: resultado largo (texto libre): se muestra en tamaño normal conservando saltos de línea. */
export type ResultRow = { label: string; value: string; primary?: boolean; text?: boolean };

export function ResultPanel({ rows, summary, copyText, tool }: { rows: ResultRow[]; summary?: string; copyText: string; tool: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setState("copied");
      track("copy_result", { tool });
    } catch {
      setState("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2500);
  };

  return (
    <div className="rounded-lg bg-soft p-4 sm:p-5">
      {summary && <p className="mb-3 text-sm text-muted">{summary}</p>}
      <dl className="grid gap-3">
        {rows.map((r) => (
          <div key={r.label} className={r.primary ? "" : "flex items-baseline justify-between gap-4 text-sm"}>
            <dt className={r.primary ? "text-sm text-muted" : "text-muted"}>{r.label}</dt>
            <dd className={r.text ? "mt-1 max-h-96 overflow-auto whitespace-pre-wrap break-words text-base leading-relaxed" : r.primary ? "num mt-0.5 break-words text-3xl font-medium sm:text-4xl" : "num font-medium"}>{r.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" onClick={copy} className="btn btn-outline">
          {state === "copied" ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
          Copiar resultado
        </button>
        <span role="status" className="text-sm text-muted">
          {state === "copied" && "Copiado"}
          {state === "failed" && "No se pudo copiar. Selecciona el texto manualmente."}
        </span>
      </div>
    </div>
  );
}

export function ToolForm({ children }: { children: ReactNode }) {
  return <div className="grid gap-5">{children}</div>;
}

/** Eventos tool_used (primera interacción) y tool_completed (primer resultado válido), una vez por visita. */
export function useToolEvents(slug: string) {
  const usedRef = useRef(false);
  const doneRef = useRef(false);
  return useMemo(
    () => ({
      used() {
        if (usedRef.current) return;
        usedRef.current = true;
        track("tool_used", { tool: slug });
      },
      completed() {
        if (doneRef.current) return;
        doneRef.current = true;
        track("tool_completed", { tool: slug });
      },
    }),
    [slug],
  );
}

export function SelectField<T extends string>(props: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {props.label}
      </label>
      <select id={id} value={props.value} onChange={(e) => props.onChange(e.target.value as T)} className="input">
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DateField(props: { label: string; value: string; onChange: (v: string) => void; error?: string | null }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {props.label}
      </label>
      <input
        id={id}
        type="date"
        value={props.value}
        min="0001-01-01"
        max="9999-12-31"
        aria-invalid={Boolean(props.error)}
        onChange={(e) => props.onChange(e.target.value)}
        className="input num"
      />
      {props.error && (
        <p role="alert" className="mt-1 text-sm text-danger">
          {props.error}
        </p>
      )}
    </div>
  );
}

export function TextArea(props: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {props.label}
      </label>
      <textarea
        id={id}
        rows={props.rows ?? 8}
        value={props.value}
        placeholder={props.placeholder}
        maxLength={200000}
        onChange={(e) => props.onChange(e.target.value)}
        className="input min-h-40 resize-y leading-relaxed"
      />
    </div>
  );
}

/** Fecha local de hoy en formato AAAA-MM-DD. Solo en cliente (evita desajustes de hidratación). */
export function todayIso(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
