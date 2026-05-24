import { useState } from "react";
import { useAuth } from "../context/AuthContext";

type Phase = "collecte" | "transit" | "douane" | "livraison" | "livree";

interface Expedition {
  id: string;
  ref: string;
  client: string;
  origine: string;
  destination: string;
  depart: string;
  arrivee: string;
  phase: Phase;
  transporteur: string;
  poids: string;
}

const MOCK: Expedition[] = [
  { id: "EXP-001", ref: "DEM-003", client: "Martin & Co",    origine: "Liège",     destination: "Londres",   depart: "2024-05-05", arrivee: "2024-05-09", phase: "douane",    transporteur: "DHL",    poids: "80 kg"  },
  { id: "EXP-002", ref: "DEM-002", client: "Leroy SPRL",     origine: "Gand",      destination: "Amsterdam", depart: "2024-05-03", arrivee: "2024-05-06", phase: "livree",    transporteur: "FedEx",  poids: "340 kg" },
  { id: "EXP-003", ref: "DEM-007", client: "Peeters Logics", origine: "Bruges",    destination: "Rotterdam", depart: "2024-05-11", arrivee: "2024-05-13", phase: "transit",   transporteur: "UPS",    poids: "175 kg" },
  { id: "EXP-004", ref: "DEM-008", client: "Dupont SA",      origine: "Bruxelles", destination: "Francfort", depart: "2024-05-12", arrivee: "2024-05-15", phase: "collecte",  transporteur: "TNT",    poids: "95 kg"  },
  { id: "EXP-005", ref: "DEM-004", client: "Verbeke NV",     origine: "Anvers",    destination: "Berlin",    depart: "2024-05-07", arrivee: "2024-05-10", phase: "livree",    transporteur: "DHL",    poids: "210 kg" },
  { id: "EXP-006", ref: "DEM-006", client: "Claes Import",   origine: "Bruxelles", destination: "Madrid",    depart: "2024-05-10", arrivee: "2024-05-16", phase: "livraison", transporteur: "Geodis", poids: "430 kg" },
];

const PHASES: Phase[] = ["collecte", "transit", "douane", "livraison", "livree"];

const PHASE_STYLE: Record<Phase, { label: string; bg: string; color: string }> = {
  collecte:  { label: "Collecte",  bg: "#EEEDFE", color: "#3C3489" },
  transit:   { label: "Transit",   bg: "#E6F1FB", color: "#0C447C" },
  douane:    { label: "Douane",    bg: "#FAEEDA", color: "#633806" },
  livraison: { label: "Livraison", bg: "#EAF3DE", color: "#27500A" },
  livree:    { label: "Livrée",    bg: "#E1F5EE", color: "#085041" },
};

function PhaseBar({ phase }: { phase: Phase }) {
  const current = PHASES.indexOf(phase);
  return (
    <div className="flex items-center gap-1 mt-3">
      {PHASES.map((p, i) => {
        const done = i <= current;
        const s = PHASE_STYLE[p];
        return (
          <div key={p} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full h-1.5 rounded-full transition-all"
              style={{ background: done ? s.color : "var(--border)" }}
            />
            <span
              className="text-xs"
              style={{ color: done ? s.color : "var(--text-muted)", fontSize: "10px" }}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Expeditions() {
  const { user } = useAuth();
  const [view, setView] = useState<"table" | "cards">("cards");
  const [search, setSearch] = useState("");

  const data = MOCK
    .filter((e) => user?.role === "client" ? e.client === "Dupont SA" : true)
    .filter((e) =>
      [e.id, e.client, e.origine, e.destination, e.transporteur]
        .join(" ").toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">

        <div className="flex items-center gap-3">
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
              width: "200px",
            }}
          />

          {/* Toggle vue */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            {(["cards", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-2 text-sm transition-colors"
                style={{
                  background: view === v ? "var(--bg-active)" : "transparent",
                  color: view === v ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                {v === "cards" ? "Cards" : "Tableau"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vue Cards */}
      {view === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((e) => {
            const s = PHASE_STYLE[e.phase];
            return (
              <div
                key={e.id}
                className="p-5 rounded-2xl space-y-2"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {e.client}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {e.id} · {e.ref}
                    </p>
                  </div>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {s.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  <span>{e.origine}</span>
                  <span>→</span>
                  <span style={{ color: "var(--text-primary)" }}>{e.destination}</span>
                </div>

                <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>{e.transporteur}</span>
                  <span>{e.poids}</span>
                  <span>Arrivée : {e.arrivee}</span>
                </div>

                <PhaseBar phase={e.phase} />
              </div>
            );
          })}
        </div>
      )}

      {/* Vue Tableau */}
      {view === "table" && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
                {["ID", "Réf.", "Client", "Origine → Destination", "Départ", "Arrivée", "Transporteur", "Statut"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((e, i) => {
                const s = PHASE_STYLE[e.phase];
                return (
                  <tr
                    key={e.id}
                    style={{
                      background: i % 2 === 0 ? "var(--bg-app)" : "var(--bg-surface)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{e.id}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{e.ref}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{e.client}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{e.origine} → {e.destination}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{e.depart}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{e.arrivee}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{e.transporteur}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {data.length} expédition{data.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}