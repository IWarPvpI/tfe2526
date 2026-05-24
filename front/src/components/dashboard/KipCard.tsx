type Props = {
  title: string;
  value: string;
  growth: string;
  positive?: boolean;
};

export default function KpiCard({ title, value, growth, positive = true }: Props) {
  return (
    <div
      className="p-5 rounded-2xl"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        {title}
      </p>
      <p className="text-2xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
      <p className="text-sm mt-1 font-medium" style={{ color: positive ? "#22c55e" : "#ef4444" }}>
        {growth}
      </p>
    </div>
  );
}