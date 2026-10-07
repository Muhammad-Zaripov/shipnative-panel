"use client";

import { useCallback, useEffect, useState } from "react";

import Shell from "@/components/Shell";
import { Card, ErrorBox, LoadMore, Pill } from "@/components/ui";
import { api } from "@/lib/api";
import { date, kindLabel, statusLabel, usd } from "@/lib/format";
import type { AdminRun, Page } from "@/lib/types";

function seconds(r: AdminRun) {
  if (!r.finished_at) return "";
  return `${Math.round((new Date(r.finished_at).getTime() - new Date(r.created_at).getTime()) / 1000)} s`;
}

export default function RunsPage() {
  const [failedOnly, setFailedOnly] = useState(false);
  const [items, setItems] = useState<AdminRun[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (failed: boolean, cursor: string | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (failed) params.set("failed", "true");
      if (cursor) params.set("cursor", cursor);
      const page = await api<Page<AdminRun>>(`/admin/runs?${params}`);
      setItems((prev) => (cursor ? [...prev, ...page.items] : page.items));
      setNext(page.next_cursor);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(failedOnly, null);
  }, [failedOnly, load]);

  return (
    <Shell title="Generatsiyalar">
      <label className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" checked={failedOnly} onChange={(e) => setFailedOnly(e.target.checked)} />
        Faqat xatolar
      </label>
      {error && <ErrorBox message={error} />}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-3 py-2">Loyiha</th>
              <th className="px-3 py-2">Turi</th>
              <th className="px-3 py-2">Holat</th>
              <th className="px-3 py-2">Fixer</th>
              <th className="px-3 py-2">Tokenlar</th>
              <th className="px-3 py-2">Narx</th>
              <th className="px-3 py-2">Vaqt</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((r) => (
              <tr key={r.id}>
                <td className="max-w-56 truncate px-3 py-2 font-medium">{r.project_name}</td>
                <td className="px-3 py-2">{kindLabel[r.kind] ?? r.kind}</td>
                <td className="px-3 py-2">
                  <Pill tone={r.status === "failed" ? "red" : r.status === "succeeded" ? "green" : "amber"}>
                    {statusLabel[r.status] ?? r.status}
                  </Pill>
                  {r.error_code && <div className="mt-1 text-xs text-red-600">{r.error_code}</div>}
                </td>
                <td className="px-3 py-2">{r.fix_attempts || ""}</td>
                <td className="px-3 py-2 text-slate-500">
                  {Math.round(r.input_tokens / 1000)}k / {Math.round(r.output_tokens / 1000)}k
                </td>
                <td className="px-3 py-2">{usd(r.cost_micros)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-500">
                  {date(r.created_at)} {seconds(r) && <span className="text-slate-400">({seconds(r)})</span>}
                </td>
                <td className="px-3 py-2">
                  {r.preview_url && (
                    <a href={r.preview_url} target="_blank" rel="noreferrer" className="text-brand">
                      ↗
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && items.length === 0 && !error && <Card className="mt-3 text-slate-500">Hech narsa yo&apos;q.</Card>}
      {next && <LoadMore loading={loading} onClick={() => void load(failedOnly, next)} />}
    </Shell>
  );
}
