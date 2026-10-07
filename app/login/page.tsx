"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError, login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(name, password);
      router.replace("/");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Login yoki parol noto'g'ri."
          : err instanceof ApiError && err.status === 429
            ? "Juda ko'p urinish — bir daqiqadan keyin qayta urinib ko'ring."
            : "Server bilan bog'lanib bo'lmadi.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-1 text-xl font-bold">
          Ship<span className="text-brand">Native</span> admin
        </div>
        <p className="mb-6 text-sm text-slate-500">
          Login va parolni Telegram botda <code className="rounded bg-slate-100 px-1">/panel</code> buyrug&apos;i
          bilan oling.
        </p>
        <label className="mb-1 block text-sm font-medium">Login</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="username"
          autoFocus
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
        />
        <label className="mb-1 block text-sm font-medium">Parol</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
        />
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <button
          disabled={busy || !name || !password}
          className="w-full rounded-lg bg-brand py-2.5 font-medium text-white disabled:opacity-40"
        >
          {busy ? "Kirilmoqda…" : "Kirish"}
        </button>
      </form>
    </div>
  );
}
