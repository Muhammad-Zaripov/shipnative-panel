// Small shared building blocks for the admin pages.

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>{children}</div>;
}

const tones = {
  neutral: "bg-slate-100 text-slate-600",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-700",
  brand: "bg-brand-soft text-brand",
};

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: keyof typeof tones }) {
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-brand text-white hover:opacity-90",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-40 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</div>;
}

export function LoadMore({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <div className="mt-4 text-center">
      <Button variant="secondary" onClick={onClick} disabled={loading}>
        {loading ? "Yuklanmoqda…" : "Yana yuklash"}
      </Button>
    </div>
  );
}
