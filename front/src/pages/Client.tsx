import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export interface ClientMock {
  id: string;
  nom: string;
  type: "SA" | "SPRL" | "NV" | "SCS" | "Indépendant";
  email: string;
  tel: string;
  ville: string;
  pays: string;
  since: string;
  expeditions: number;
  ca: number;
  actif: boolean;
  rue?: string;
  numero?: string;
  codePostal?: string;
  tva?: string;
  contactPerson?: string;
  recentShipments?: Array<{ id: string; date: string; destination: string; status: string; total: number }>;
}

export const MOCK_CLIENTS: ClientMock[] = [
  { id: "CLT-001", nom: "Dupont SA",       type: "SA",          email: "contact@dupont.be",   tel: "+32 2 123 45 67", ville: "Bruxelles", pays: "BE", since: "2021-03", expeditions: 48, ca: 28400, actif: true  },
  { id: "CLT-002", nom: "Leroy SPRL",      type: "SPRL",        email: "info@leroy.be",        tel: "+32 9 234 56 78", ville: "Gand",      pays: "BE", since: "2022-01", expeditions: 23, ca: 14200, actif: true  },
  { id: "CLT-003", nom: "Martin & Co",     type: "Indépendant", email: "martin@martinco.be",   tel: "+32 4 345 67 89", ville: "Liège",     pays: "BE", since: "2023-06", expeditions: 12, ca: 6800,  actif: true  },
  { id: "CLT-004", nom: "Verbeke NV",      type: "NV",          email: "logistics@verbeke.be", tel: "+32 3 456 78 90", ville: "Anvers",    pays: "BE", since: "2020-11", expeditions: 87, ca: 52100, actif: true  },
  { id: "CLT-005", nom: "Duchêne SCS",     type: "SCS",         email: "admin@duchene.be",     tel: "+32 81 567 89 01",ville: "Namur",     pays: "BE", since: "2022-08", expeditions: 9,  ca: 3200,  actif: false },
  { id: "CLT-006", nom: "Claes Import",    type: "SA",          email: "import@claes.be",      tel: "+32 2 678 90 12", ville: "Bruxelles", pays: "BE", since: "2021-05", expeditions: 34, ca: 31600, actif: true  },
  { id: "CLT-007", nom: "Peeters Logics",  type: "NV",          email: "ops@peeters.be",       tel: "+32 50 789 01 23",ville: "Bruges",    pays: "BE", since: "2023-01", expeditions: 18, ca: 11400, actif: true  },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const initials = (nom: string) =>
  nom.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const AVATAR_COLORS = ["#0C447C", "#3C3489", "#085041", "#633806", "#791F1F", "#185FA5", "#27500A"];

export default function Clients() {
  const { isAtLeast } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterActif, setFilterActif] = useState<"" | "true" | "false">("");

  const data = MOCK_CLIENTS
    .filter((c) => filterActif !== "" ? String(c.actif) === filterActif : true)
    .filter((c) =>
      [c.nom, c.email, c.ville, c.id].join(" ").toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">

        {isAtLeast("admin") && (
          <button
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            + Nouveau client
          </button>
        )}
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
          value={filterActif}
          onChange={(e) => setFilterActif(e.target.value as "" | "true" | "false")}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        >
          <option value="">Tous</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.map((c, i) => (
          <div
            key={c.id}
            className="p-5 rounded-2xl space-y-4"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              opacity: c.actif ? 1 : 0.6,
            }}
          >
            {/* Top */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] + "22", color: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
              >
                {initials(c.nom)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {c.nom}
                  </p>
                  {!c.actif && (
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "#FCEBEB", color: "#791F1F" }}>
                      Inactif
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                  {c.type} · {c.ville}, {c.pays}
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-1">
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>✉ {c.email}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>☎ {c.tel}</p>
            </div>

            {/* Stats */}
            <div
              className="grid grid-cols-3 gap-2 pt-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {[
                { label: "Client depuis", value: c.since },
                { label: "Expéditions",   value: String(c.expeditions) },
                { label: "CA total",      value: fmt(c.ca) },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "10px", marginTop: "2px" }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            {isAtLeast("admin") && (
              <div className="flex gap-2 pt-1">
                <button
                  className="flex-1 text-xs py-1.5 rounded-lg transition-colors"
                  style={{ background: "var(--bg-hover)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                >
                  Modifier
                </button>
                <button
                  onClick={() => navigate(`/clients/${c.id}`)}
                  className="flex-1 text-xs py-1.5 rounded-lg transition-colors cursor-pointer font-medium"
                  style={{ background: "var(--accent)", color: "#ffffff" }}
                >
                  Voir détail →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {data.length} client{data.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}