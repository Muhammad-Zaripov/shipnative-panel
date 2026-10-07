"use client";

import { useCallback, useEffect, useState } from "react";

import Shell from "@/components/Shell";
import { Button, Card, ErrorBox, LoadMore, Pill } from "@/components/ui";
import { api } from "@/lib/api";
import { date, usd } from "@/lib/format";
import type { AdminUser, Page, Quota } from "@/lib/types";

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<AdminUser[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (q: string, cursor: string | null) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (cursor) params.set("cursor", cursor);
      const page = await api<Page<AdminUser>>(`/admin/users?${params}`);
      setItems((prev) => (cursor ? [...prev, ...page.items] : page.items));
      setNext(page.next_cursor);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search: one request after typing stops.
  useEffect(() => {
    const t = setTimeout(() => void load(query.trim(), null), 300);
    return () => clearTimeout(t);
  }, [query, load]);

  function replace(u: AdminUser) {
    setItems((prev) => prev.map((x) => (x.id === u.id ? u : x)));
  }

  async function grant(u: AdminUser, sites: number, edits: number) {
    try {
      const q = await api<Quota>(`/admin/users/${u.id}/grant`, { method: "POST", body: { sites, edits } });
      replace({ ...u, quota: q });
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function grantCustom(u: AdminUser) {
    const input = prompt("Nechta sayt va tahrir qo'shamiz? Masalan: 2 10", "1 5");
    if (!input) return;
    const [sites, edits] = input.trim().split(/\s+/).map(Number);
    if (!Number.isInteger(sites) || !Number.isInteger(edits) || sites < 0 || edits < 0) {
      alert("Ikki butun son kiriting: sayt va tahrir");
      return;
    }
    await grant(u, sites, edits);
  }

  async function toggleBlock(u: AdminUser) {
    const action = u.blocked ? "blokdan chiqaramizmi" : "bloklaymizmi";
    if (!confirm(`${u.name || u.phone} — ${action}?`)) return;
    try {
      await api(`/admin/users/${u.id}/block`, { method: "POST", body: { blocked: !u.blocked } });
      replace({ ...u, blocked: !u.blocked });
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <Shell title="Foydalanuvchilar">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Telefon, ism yoki @username"
        className="mb-4 w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand"
      />
      {error && <ErrorBox message={error} />}
      <div className="grid gap-3">
        {items.map((u) => (
          <Card key={u.id} className={u.blocked ? "opacity-60" : ""}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-semibold">
                  {u.name || u.phone}
                  {u.role === "admin" && <Pill tone="brand">admin</Pill>}
                  {u.blocked && <Pill tone="red">bloklangan</Pill>}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {u.phone}
                  {u.telegram_username && ` · @${u.telegram_username}`} · ro&apos;yxatdan: {date(u.created_at)}
                  {u.last_login_at && ` · oxirgi kirish: ${date(u.last_login_at)}`}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Pill tone={u.quota && u.quota.sites_left + u.quota.edits_left === 0 ? "amber" : "neutral"}>
                    {u.quota ? `${u.quota.sites_left} sayt · ${u.quota.edits_left} tahrir qoldi` : "Limit hali olinmagan"}
                  </Pill>
                  <Pill>{u.projects} ta loyiha</Pill>
                  <Pill>AI: {usd(u.cost_micros)}</Pill>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => grant(u, 1, 0)}>+1 sayt</Button>
                <Button onClick={() => grant(u, 0, 5)}>+5 tahrir</Button>
                <Button variant="secondary" onClick={() => grantCustom(u)}>
                  Boshqa…
                </Button>
                {u.role !== "admin" && (
                  <Button variant={u.blocked ? "secondary" : "danger"} onClick={() => toggleBlock(u)}>
                    {u.blocked ? "Blokdan chiqarish" : "Bloklash"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {!loading && items.length === 0 && !error && <p className="text-slate-500">Hech kim topilmadi.</p>}
      </div>
      {next && <LoadMore loading={loading} onClick={() => void load(query.trim(), next)} />}
    </Shell>
  );
}
