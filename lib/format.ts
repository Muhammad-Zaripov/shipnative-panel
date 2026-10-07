export const usd = (micros: number) => `$${(micros / 1e6).toFixed(micros >= 1e6 ? 2 : 4)}`;

export const date = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("uz-UZ", { dateStyle: "short", timeStyle: "short" }) : "—";

export const kindLabel: Record<string, string> = { initial: "Yangi sayt", edit: "Tahrir", rollback: "Qaytarish" };

export const statusLabel: Record<string, string> = {
  queued: "Navbatda",
  planning: "Reja",
  coding: "Kod",
  building: "Build",
  fixing: "Tuzatish",
  publishing: "Nashr",
  succeeded: "Tayyor",
  failed: "Xato",
};
