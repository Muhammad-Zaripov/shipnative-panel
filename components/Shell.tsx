"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { isLoggedIn, logout } from "@/lib/api";

const nav = [
  { href: "/", label: "Umumiy", icon: "📊" },
  { href: "/users/", label: "Foydalanuvchilar", icon: "👥" },
  { href: "/projects/", label: "Loyihalar", icon: "🌐" },
  { href: "/runs/", label: "Generatsiyalar", icon: "⚙️" },
  { href: "/evals/", label: "Sifat testi", icon: "🧪" },
];

/** Every admin page: sidebar navigation + a login guard. */
export default function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) router.replace("/login/");
    else setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <div className="mb-6 px-2 text-lg font-bold">
          Ship<span className="text-brand">Native</span> <span className="text-sm font-normal text-slate-400">admin</span>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                path === n.href ? "bg-brand-soft text-brand" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="mr-2">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={async () => {
            await logout();
            router.replace("/login/");
          }}
          className="mt-auto rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-100"
        >
          ↩ Chiqish
        </button>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <nav className="mb-4 flex gap-2 overflow-x-auto md:hidden">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                path === n.href ? "bg-brand text-white" : "bg-white text-slate-600"
              }`}
            >
              {n.icon} {n.label}
            </Link>
          ))}
        </nav>
        <h1 className="mb-6 text-2xl font-bold">{title}</h1>
        {children}
      </main>
    </div>
  );
}
