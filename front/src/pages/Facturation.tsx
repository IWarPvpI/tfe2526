import { useState } from "react";
import { useAuth } from "../context/AuthContext";

type PayStatus = "payee" | "en_attente" | "en_retard";

interface Facture {
  id: string;
  ref: string;
  client: string;
  date: string;
  echeance: string;
  montantHT: number;
  tva: number;
  status: PayStatus;
}

const MOCK: Facture[] = [
  { id: "FAC-2024-001", ref: "DEM-004", client: "Verbeke NV",      date: "2024-05-10", echeance: "2024-06-10", montantHT: 1240.00, tva: 21, status: "payee"      },
  { id: "FAC-2024-002", ref: "DEM-002", client: "Leroy SPRL",      date: "2024-05-06", echeance: "2024-06-06", montantHT: 2890.00, tva: 21, status: "en_attente" },
  { id: "FAC-2024-003", ref: "DEM-003", client: "Martin & Co",     date: "2024-05-09", echeance: "2024-05-24", montantHT: 680.00,  tva: 21, status: "en_retard"  },
  { id: "FAC-2024-004", ref: "DEM-007", client: "Peeters Logics",  date: "2024-05-13", echeance: "2024-06-13", montantHT: 1560.00, tva: 21, status: "en_attente" },
  { id: "FAC-2024-005", ref: "DEM-008", client: "Dupont SA",       date: "2024-05-12", echeance: "2024-06-12", montantHT: 870.00,  tva: 21, status: "en_attente" },
  { id: "FAC-2024-006", ref: "DEM-006", client: "Claes Import",    date: "2024-05-16", echeance: "2024-06-16", montantHT: 3420.00, tva: 21, status: "en_attente" },
];

const STATUS_STYLE: Record<PayStatus, { label: string; bg: string; color: string }> = {
  payee:      { label: "Payée",      bg: "#EAF3DE", color: "#27500A" },
  en_attente: { label: "En attente", bg: "#FAEEDA", color: "#633806" },
  en_retard:  { label: "En retard",  bg: "#FCEBEB", color: "#791F1F" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(n);

export default function Facturation() {
  const { user, isAtLeast } = useAuth();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<PayStatus | "">("");

  const data = MOCK
    .filter((f) => user?.role === "client" ? f.client === "Dupont SA" : true)
    .filter((f) => filterStatus ? f.status === filterStatus : true)
    .filter((f) =>
      [f.id, f.ref, f.client].join(" ").toLowerCase().includes(search.toLowerCase())
    );

  const totalHT  = data.reduce((s, f) => s + f.montantHT, 0);
  const totalTTC = data.reduce((s, f) => s + f.montantHT * (1 + f.tva / 100), 0);

  return (
    <div className="space-y-5">
      {/* Header */}


      {/* KPI mini */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total HT",      value: fmt(totalHT)  },
          { label: "Total TTC",     value: fmt(totalTTC) },
          { label: "En attente",    value: fmt(data.filter(f => f.status === "en_attente").reduce((s, f) => s + f.montantHT * 1.21, 0)) },
          { label: "En retard",     value: fmt(data.filter(f => f.status === "en_retard").reduce((s, f) => s + f.montantHT * 1.21, 0)) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="p-4 rounded-xl"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            width: "220px",
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as PayStatus | "")}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        >
          <option value="">Tous les statuts</option>
          <option value="payee">Payée</option>
          <option value="en_attente">En attente</option>
          <option value="en_retard">En retard</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
              {["N° Facture", "Réf.", "Client", "Date", "Échéance", "HT", "TVA", "TTC", "Statut", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }}>
                  Aucun résultat
                </td>
              </tr>
            ) : data.map((f, i) => {
              const s = STATUS_STYLE[f.status];
              const ttc = f.montantHT * (1 + f.tva / 100);
              return (
                <tr
                  key={f.id}
                  style={{
                    background: i % 2 === 0 ? "var(--bg-app)" : "var(--bg-surface)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{f.id}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{f.ref}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{f.client}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{f.date}</td>
                  <td
                    className="px-4 py-3"
                    style={{ color: f.status === "en_retard" ? "#A32D2D" : "var(--text-muted)" }}
                  >
                    {f.echeance}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{fmt(f.montantHT)}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{f.tva}%</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(ttc)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-xs px-3 py-1 rounded-lg transition-colors"
                      style={{
                        background: "var(--bg-hover)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {data.length} facture{data.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}