"use client";

import { useCallback, useEffect, useState } from "react";

import Shell from "@/components/Shell";
import { Card, ErrorBox, LoadMore, Pill } from "@/components/ui";
import { api } from "@/lib/api";
import { date } from "@/lib/format";
import type { AdminProject, Page } from "@/lib/types";

export default function ProjectsPage() {
  const [items, setItems] = useState<AdminProject[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (cursor: string | null) => {
    setLoading(true);
    try {
      const page = await api<Page<AdminProject>>(`/admin/projects${cursor ? `?cursor=${cursor}` : ""}`);
      setItems((prev) => (cursor ? [...prev, ...page.items] : page.items));
      setNext(page.next_cursor);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(null);
  }, [load]);

  return (
    <Shell title="Loyihalar">
      {error && <ErrorBox message={error} />}
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-semibold">{p.name}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {p.owner_name || p.owner_phone} · {p.owner_phone} · {date(p.created_at)}
                </div>
              </div>
              <Pill>v{p.head_version}</Pill>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Pill tone="brand">{p.type}</Pill>
              {p.preview_url ? (
                <a href={p.preview_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand">
                  Saytni ochish ↗
                </a>
              ) : (
                <span className="text-sm text-slate-400">Sayt hali yo&apos;q</span>
              )}
            </div>
          </Card>
        ))}
      </div>
      {!loading && items.length === 0 && !error && <p className="text-slate-500">Hozircha loyiha yo&apos;q.</p>}
      {next && <LoadMore loading={loading} onClick={() => void load(next)} />}
    </Shell>
  );
}
