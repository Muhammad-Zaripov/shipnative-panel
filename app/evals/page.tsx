"use client";

import { useCallback, useEffect, useState } from "react";

import Shell from "@/components/Shell";
import { Button, Card, ErrorBox, Pill } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { date, usd } from "@/lib/format";
import type { EvalCase, EvalCaseResult, EvalRun } from "@/lib/types";

// What one case costs on average (real models); shown before starting a run.
const CASE_COST_MICROS = 55_000;

const caseStatus: Record<EvalCaseResult["status"], string> = {
  pending: "Navbatda",
  running: "Qurilmoqda…",
  done: "Tayyor",
  error: "Xato",
};

// site.ts values come quoted ("bold"); show them bare.
const bare = (v?: string) => (v ?? "").replace(/"/g, "");

function CaseCard({ c, title }: { c: EvalCaseResult; title?: string }) {
  const tone = c.status === "error" || (c.status === "done" && !c.ok) ? "red" : c.status === "done" ? "green" : "amber";
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{title ?? c.name}</div>
          <div className="text-xs text-slate-400">{c.name}</div>
        </div>
        <Pill tone={tone}>{c.status === "done" && !c.ok ? "Qurilmadi" : caseStatus[c.status]}</Pill>
      </div>
      {c.status === "done" && (
        <div className="flex flex-wrap gap-1.5 text-xs">
          {c.style && <Pill>uslub: {bare(c.style)}</Pill>}
          {c.hero && <Pill>hero: {bare(c.hero)}</Pill>}
          {c.effects && <Pill>effekt: {bare(c.effects).replace(/[{}]/g, "").trim()}</Pill>}
          <Pill tone={c.first_try ? "green" : "amber"}>{c.first_try ? "1-urinishda" : `Fixer: ${c.fixes}`}</Pill>
        </div>
      )}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {c.cost_micros > 0 && usd(c.cost_micros)}
          {c.duration_ms > 0 && ` · ${Math.round(c.duration_ms / 1000)} s`}
        </span>
        {c.preview_url && (
          <a href={c.preview_url} target="_blank" rel="noreferrer" className="font-medium text-brand">
            Saytni ochish ↗
          </a>
        )}
      </div>
      {c.error && (
        <details className="text-xs text-red-600">
          <summary className="cursor-pointer">Xato tafsiloti</summary>
          <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap">{c.error}</pre>
        </details>
      )}
    </Card>
  );
}

export default function EvalsPage() {
  const [cases, setCases] = useState<EvalCase[]>([]);
  const [runs, setRuns] = useState<EvalRun[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api<{ cases: EvalCase[]; runs: EvalRun[] }>("/admin/evals");
      setCases(res.cases);
      setRuns(res.runs);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // A running eval updates every few seconds.
  const running = runs.some((r) => r.status === "running");
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => void load(), 5000);
    return () => clearInterval(t);
  }, [running, load]);

  const toggle = (name: string) =>
    setSelected((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name]));

  const start = async () => {
    if (!selected.length) return;
    const cost = usd(selected.length * CASE_COST_MICROS);
    if (!confirm(`${selected.length} ta sayt quriladi. Taxminiy narx: ${cost}. Boshlaymizmi?`)) return;
    setStarting(true);
    setError("");
    try {
      await api("/admin/evals", { method: "POST", body: { cases: selected } });
      setSelected([]);
      await load();
    } catch (e) {
      setError(e instanceof ApiError && e.code === "eval.busy" ? "Boshqa test hali ishlayapti." : (e as Error).message);
    } finally {
      setStarting(false);
    }
  };

  const titles = Object.fromEntries(cases.map((c) => [c.name, c.title]));

  return (
    <Shell title="Sifat testi (eval)">
      <p className="mb-4 max-w-3xl text-sm text-slate-500">
        Namunaviy briflar haqiqiy AI orqali sayt bo&apos;lib quriladi. Bazaga va foydalanuvchilarga ta&apos;sir qilmaydi;
        har bir sayt preview sifatida ochiladi. Har biri ~{usd(CASE_COST_MICROS)} va ~1–2 daqiqa.
      </p>
      {error && <ErrorBox message={error} />}

      <Card className="mb-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="font-semibold">Briflarni tanlang</div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setSelected(selected.length ? [] : cases.map((c) => c.name))}>
              {selected.length ? "Tozalash" : "Hammasi"}
            </Button>
            <Button onClick={() => void start()} disabled={!selected.length || starting || running}>
              {running ? "Test ishlayapti…" : `Boshlash (${selected.length}) · ${usd(selected.length * CASE_COST_MICROS)}`}
            </Button>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <label
              key={c.name}
              className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm ${
                selected.includes(c.name) ? "border-brand bg-brand-soft" : "border-slate-200"
              }`}
            >
              <input type="checkbox" checked={selected.includes(c.name)} onChange={() => toggle(c.name)} />
              <span>
                <span className="font-medium">{c.title}</span>{" "}
                <span className="text-xs uppercase text-slate-400">{c.language}</span>
                <span className="block text-xs text-slate-500">{c.summary}</span>
                <span className="block text-xs text-slate-400">{c.facts} ta fakt</span>
              </span>
            </label>
          ))}
        </div>
      </Card>

      {runs.map((r) => {
        const done = r.cases.filter((c) => c.status === "done" || c.status === "error").length;
        const firstTry = r.cases.filter((c) => c.first_try).length;
        return (
          <section key={r.id} className="mb-8">
            <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="text-lg font-semibold">{date(r.started_at)}</h2>
              <Pill tone={r.status === "running" ? "amber" : "green"}>
                {r.status === "running" ? `Ishlayapti ${done}/${r.cases.length}` : "Tugadi"}
              </Pill>
              <span className="text-sm text-slate-500">
                {r.prompt_version} · 1-urinishda: {firstTry}/{r.cases.length} · jami {usd(r.cost_micros)}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {r.cases.map((c) => (
                <CaseCard key={c.name} c={c} title={titles[c.name]} />
              ))}
            </div>
          </section>
        );
      })}
      {runs.length === 0 && !error && <Card className="text-slate-500">Hali test o&apos;tkazilmagan.</Card>}
    </Shell>
  );
}
