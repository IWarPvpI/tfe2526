import { useTranslation } from "react-i18next";
import KpiCard from "../components/dashboard/KipCard";

export default function Dashboard() {
  const { t } = useTranslation();

  const KPI_DATA = [
    { titleKey: "kpi.demandes",          value: "1 248",   growth: "+12%" },
    { titleKey: "kpi.economies_clients", value: "€24 780", growth: "+18%" },
    { titleKey: "kpi.marge_brute",       value: "€7 842",  growth: "+15%" },
    { titleKey: "kpi.expeditions",       value: "320",     growth: "+9%"  },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_DATA.map(({ titleKey, value, growth }) => (
          <KpiCard key={titleKey} title={t(titleKey)} value={value} growth={growth} />
        ))}
      </div>

      <div
        className="rounded-2xl p-6 flex items-center justify-center h-48"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
          fontSize: "0.875rem",
        }}
      >
        {t("dashboard.charts_soon")}
      </div>
    </div>
  );
}