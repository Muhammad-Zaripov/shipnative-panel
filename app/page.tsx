"use client";

import { useEffect, useState } from "react";

import Shell from "@/components/Shell";
import { Card, ErrorBox } from "@/components/ui";
import { api } from "@/lib/api";
import { usd } from "@/lib/format";
import type { Period, Stats } from "@/lib/types";

function runs(p: Period, kind: string, status: string) {
  return p.runs.filter((r) => r.kind === kind && r.status === status).reduce((n, r) => n + r.runs, 0);
}

function PeriodCard({ title, p }: { title: string; p: Period }) {
  const rows: [string, string][] = [
    ["Yangi foydalanuvchilar", String(p.new_users)],
    ["Yangi loyihalar", String(p.new_projects)],
    ["Saytlar ✅ / ❌", `${runs(p, "initial", "succeeded")} / ${runs(p, "initial", "failed")}`],
    ["Tahrirlar ✅ / ❌", `${runs(p, "edit", "succeeded")} / ${runs(p, "edit", "failed")}`],
    ["Versiyaga qaytish", String(runs(p, "rollback", "succeeded"))],
    ["AI xarajati", usd(p.cost_micros)],
    ["AI chaqiruvlari", String(p.llm_calls)],
  ];
  return (
    <Card>
      <h2 className="mb-3 font-semibold">{title}</h2>
      <dl className="divide-y divide-slate-100">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 text-sm">
            <dt className="text-slate-500">{k}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stats>("/admin/stats").then(setStats, (e: Error) => setError(e.message));
  }, []);

  return (
    <Shell title="Umumiy">
      {error && <ErrorBox message={error} />}
      {stats && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="flex flex-col justify-center">
            <div className="text-sm text-slate-500">Jami foydalanuvchilar</div>
            <div className="text-4xl font-bold">{stats.total_users}</div>
          </Card>
          <PeriodCard title="Bugun" p={stats.today} />
          <PeriodCard title="Oxirgi 7 kun" p={stats.week} />
        </div>
      )}
    </Shell>
  );
}
