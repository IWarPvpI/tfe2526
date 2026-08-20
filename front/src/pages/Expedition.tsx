import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api.service";

type Phase = "INITIATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED";

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
  trackingNumber?: string;
  labelUrl?: string;
}

const PHASES: Phase[] = ["INITIATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];

const PHASE_STYLE: Record<Phase, { label: string; bg: string; color: string }> = {
  INITIATED:        { label: "Initié",        bg: "#EEEDFE", color: "#3C3489" },
  PICKED_UP:        { label: "Collecté",      bg: "#FAEEDA", color: "#633806" },
  IN_TRANSIT:       { label: "En transit",    bg: "#E6F1FB", color: "#0C447C" },
  OUT_FOR_DELIVERY: { label: "En livraison",  bg: "#EAF3DE", color: "#27500A" },
  DELIVERED:        { label: "Livré",         bg: "#E1F5EE", color: "#085041" },
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
  const [expeditionsList, setExpeditionsList] = useState<Expedition[]>([]);
  const [view, setView] = useState<"table" | "cards">("cards");
  const [search, setSearch] = useState("");

  const [selectedDetails, setSelectedDetails] = useState<Expedition | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsTracking, setDetailsTracking] = useState<any | null>(null);

  const [selectedAlert, setSelectedAlert] = useState<Expedition | null>(null);
  const [alertSuccess, setAlertSuccess] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState<{ type: "bordereau" | "preuve"; exp: Expedition } | null>(null);

  useEffect(() => {
    apiService.getExpeditions()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          const mapped: Expedition[] = res.map((r: any, idx: number) => {
            const ship = r.shippingDetails || {};
            const orig = ship.origine || {};
            const dest = ship.destination || {};

            let phase: Phase = "INITIATED";
            if (r.status === "DELIVERED" || r.status === "DL") phase = "DELIVERED";
            else if (r.status === "OUT_FOR_DELIVERY" || r.status === "OD") phase = "OUT_FOR_DELIVERY";
            else if (r.status === "IN_TRANSIT" || r.status === "IT" || r.status === "SHIPPED") phase = "IN_TRANSIT";
            else if (r.status === "PICKED_UP" || r.status === "PU") phase = "PICKED_UP";
            else if (r.status === "INITIATED" || r.status === "CONFIRMED" || r.status === "OC" || r.status === "DRAFT") phase = "INITIATED";

            const clientName = r.user?.firstName
              ? `${r.user.firstName} ${r.user.lastName}`
              : (r.user?.email ? r.user.email : "");

            const origCity = orig.ville ?? orig.city ?? orig.rue ?? orig.street ?? "";
            const destCity = dest.ville ?? dest.city ?? dest.rue ?? dest.street ?? "";

            const transportName =
              r.selectedOption?.serviceName ??
              r.selectedOption?.serviceType ??
              r.selectedOption?.service ??
              "";

            return {
              id: r.id ? `EXP-${r.id.slice(0, 6)}` : `EXP-00${idx + 1}`,
              ref: r.fedexTrackingNumber ? r.fedexTrackingNumber : (r.id ? r.id.slice(0, 8) : ""),
              client: clientName,
              origine: origCity,
              destination: destCity,
              depart: ship.date ?? (r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : ""),
              arrivee: ship.livraisonDate ?? "",
              phase: phase,
              transporteur: transportName,
              poids: ship.poids ? `${ship.poids} kg` : "",
              trackingNumber: r.fedexTrackingNumber,
              labelUrl: r.labelUrl,
            };
          });
          setExpeditionsList(mapped);
        }
      })
      .catch(() => {
      });
  }, []);

  const handleOpenDetails = async (exp: Expedition) => {
    setSelectedDetails(exp);
    setDetailsLoading(true);
    setDetailsTracking(null);

    const trackNum = exp.trackingNumber ?? exp.ref;
    if (trackNum) {
      try {
        const res = await apiService.trackShipment(trackNum);
        setDetailsTracking(res);
      } catch (err) {
        setDetailsTracking(null);
      } finally {
        setDetailsLoading(false);
      }
    } else {
      setDetailsLoading(false);
    }
  };

  const data = expeditionsList
    .filter((e) => {
      if (!user || user.role === "admin" || user.role === "superadmin") {
        return true;
      }
      return (
        e.client.toLowerCase().includes(user.name.toLowerCase()) ||
        e.client.toLowerCase().includes(user.email.toLowerCase())
      );
    })
    .filter((e) =>
      [e.id, e.ref, e.client, e.origine, e.destination, e.transporteur]
        .join(" ").toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Expéditions & Suivi
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {data.length} expédition{data.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Rechercher par ID, N° suivi, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl outline-none"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              minWidth: "220px",
            }}
          />

          <div
            className="flex rounded-xl p-1 gap-1"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <button
              onClick={() => setView("cards")}
              className="px-3 py-1 text-xs rounded-lg font-medium transition-all"
              style={{
                background: view === "cards" ? "var(--bg-active)" : "transparent",
                color: view === "cards" ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              Cartes
            </button>
            <button
              onClick={() => setView("table")}
              className="px-3 py-1 text-xs rounded-lg font-medium transition-all"
              style={{
                background: view === "table" ? "var(--bg-active)" : "transparent",
                color: view === "table" ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              Tableau
            </button>
          </div>
        </div>
      </div>

      {view === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((e) => {
            const s = PHASE_STYLE[e.phase];
            return (
              <div
                key={e.id}
                className="rounded-2xl p-5 space-y-3 transition-all"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                      {e.id}
                    </span>
                    <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
                      {e.client}
                    </span>
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

                <div className="pt-3 flex flex-wrap items-center gap-2 border-t" style={{ borderColor: "var(--border)" }}>
                  <button
                    onClick={() => handleOpenDetails(e)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex-1"
                    style={{ background: "#4338CA", color: "#FFFFFF" }}
                  >
                    📦 Détails du colis
                  </button>

                  <button
                    onClick={() => {
                      setSelectedAlert(e);
                      setAlertSuccess(false);
                    }}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                  >
                    🔔 Créer une alerte
                  </button>

                  {e.phase === "INITIATED" && (
                    <button
                      onClick={() => setSelectedDocument({ type: "bordereau", exp: e })}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: "#EEEDFE", color: "#3C3489", border: "1px solid #CECBF6" }}
                    >
                      📄 Télécharger bordereau
                    </button>
                  )}

                  {e.phase === "DELIVERED" && (
                    <button
                      onClick={() => setSelectedDocument({ type: "preuve", exp: e })}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: "#E1F5EE", color: "#085041", border: "1px solid #9FE1CB" }}
                    >
                      ✍️ Télécharger preuve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "table" && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
                {["ID", "Réf / Suivi", "Client", "Origine → Destination", "Départ", "Arrivée", "Transporteur", "Statut", "Actions"].map((h) => (
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
                    <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{e.ref}</td>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDetails(e)}
                          className="text-xs px-2.5 py-1 rounded-md"
                          style={{ background: "#4338CA", color: "#FFFFFF" }}
                        >
                          📦 Détails
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAlert(e);
                            setAlertSuccess(false);
                          }}
                          className="text-xs px-2.5 py-1 rounded-md"
                          style={{ background: "var(--bg-surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                        >
                          🔔 Alerte
                        </button>
                        {e.phase === "INITIATED" && (
                          <button
                            onClick={() => setSelectedDocument({ type: "bordereau", exp: e })}
                            className="text-xs px-2.5 py-1 rounded-md"
                            style={{ background: "#EEEDFE", color: "#3C3489", border: "1px solid #CECBF6" }}
                          >
                            📄 Bordereau
                          </button>
                        )}
                        {e.phase === "DELIVERED" && (
                          <button
                            onClick={() => setSelectedDocument({ type: "preuve", exp: e })}
                            className="text-xs px-2.5 py-1 rounded-md"
                            style={{ background: "#E1F5EE", color: "#085041", border: "1px solid #9FE1CB" }}
                          >
                            ✍️ Preuve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            className="w-full max-w-4xl rounded-2xl p-6 shadow-2xl space-y-6 my-8"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <div>
                <h3 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>
                  📦 Détails Complets de l'Expédition : {selectedDetails.id}
                </h3>
                <p className="text-xs font-mono mt-1" style={{ color: "var(--text-muted)" }}>
                  N° Suivi / Réf : {selectedDetails.trackingNumber ?? selectedDetails.ref}
                </p>
              </div>
              <button
                onClick={() => setSelectedDetails(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all"
                style={{ background: "var(--bg-active)", color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className="p-4 rounded-xl space-y-2"
                style={{ background: "var(--bg-app)", border: "1px solid var(--border)" }}
              >
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Expéditeur & Origine
                </div>
                <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                  {selectedDetails.client}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Lieu : {selectedDetails.origine}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Date d'envoi : {selectedDetails.depart}
                </div>
              </div>

              <div
                className="p-4 rounded-xl space-y-2"
                style={{ background: "var(--bg-app)", border: "1px solid var(--border)" }}
              >
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Destinataire & Arrivée
                </div>
                <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                  Destination : {selectedDetails.destination}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Date estimée : {selectedDetails.arrivee}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Statut : {PHASE_STYLE[selectedDetails.phase].label}
                </div>
              </div>

              <div
                className="p-4 rounded-xl space-y-2"
                style={{ background: "var(--bg-app)", border: "1px solid var(--border)" }}
              >
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Caractéristiques Colis
                </div>
                <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                  Transporteur : {selectedDetails.transporteur}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Poids total : {selectedDetails.poids}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Emballage : Carton Standard
                </div>
              </div>
            </div>

            <div
              className="p-5 rounded-xl space-y-4"
              style={{ background: "var(--bg-app)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  🛰️ Événements et Historique des Scans
                </span>
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{ background: PHASE_STYLE[selectedDetails.phase].bg, color: PHASE_STYLE[selectedDetails.phase].color }}
                >
                  {detailsTracking?.status ?? PHASE_STYLE[selectedDetails.phase].label}
                </span>
              </div>

              {detailsLoading ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-2">
                  <div className="w-7 h-7 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Synchronisation avec le transporteur...</p>
                </div>
              ) : detailsTracking?.scanEvents && detailsTracking.scanEvents.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {detailsTracking.scanEvents.map((scan: any, sIdx: number) => (
                    <div key={sIdx} className="flex items-start gap-3 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: "#4338CA" }}></div>
                      <div className="flex-1">
                        <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {scan.eventDescription ?? scan.derivedStatus}
                        </div>
                        <div style={{ color: "var(--text-muted)" }}>
                          {scan.scanLocation?.city} {scan.scanLocation?.countryCode} • {scan.date ? new Date(scan.date).toLocaleString("fr-BE") : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Colis enregistré dans le système. Prise en charge en cours par {selectedDetails.transporteur}.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedDetails(null)}
                className="text-xs px-5 py-2.5 rounded-xl font-medium"
                style={{ background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                🔔 Créer une alerte de livraison
              </h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ background: "var(--bg-active)", color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            {alertSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  Alerte activée avec succès
                </h4>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Vous recevrez une notification pour toute mise à jour concernant le colis {selectedAlert.id}.
                </p>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="mt-3 text-xs px-4 py-2 rounded-xl text-white font-medium"
                  style={{ background: "#4338CA" }}
                >
                  Terminer
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p style={{ color: "var(--text-muted)" }}>
                  Configurez vos notifications pour le colis <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{selectedAlert.id}</span> ({selectedAlert.origine} → {selectedAlert.destination}).
                </p>

                <div className="space-y-2">
                  <label className="font-medium" style={{ color: "var(--text-primary)" }}>Canal de notification</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer" style={{ background: "var(--bg-app)", border: "1px solid var(--border)" }}>
                      <input type="radio" name="channel" defaultChecked />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer" style={{ background: "var(--bg-app)", border: "1px solid var(--border)" }}>
                      <input type="radio" name="channel" />
                      <span>SMS</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-medium" style={{ color: "var(--text-primary)" }}>Événements déclencheurs</label>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span style={{ color: "var(--text-muted)" }}>Retard ou incident d'acheminement</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span style={{ color: "var(--text-muted)" }}>Changement d'étape de transit</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span style={{ color: "var(--text-muted)" }}>Confirmation de livraison finale</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="px-4 py-2 rounded-xl"
                    style={{ background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => setAlertSuccess(true)}
                    className="px-4 py-2 rounded-xl text-white font-medium"
                    style={{ background: "#4338CA" }}
                  >
                    Activer l'alerte
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 my-8"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                {selectedDocument.type === "preuve" ? "✍️ Preuve de Livraison (POD)" : "📄 Bordereau d'Expédition"}
              </h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ background: "var(--bg-active)", color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            <div
              className="p-5 rounded-xl border space-y-4 text-xs font-mono"
              style={{ background: "#FFFFFF", color: "#1E293B", borderColor: "#CBD5E1" }}
            >
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-sm">UNISHIP LOGISTICS</span>
                <span>{selectedDocument.exp.transporteur}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <div className="font-bold text-slate-500">EXPÉDITEUR</div>
                  <div>{selectedDocument.exp.client}</div>
                  <div>{selectedDocument.exp.origine}</div>
                </div>
                <div>
                  <div className="font-bold text-slate-500">DESTINATAIRE</div>
                  <div>Destinataire Uniship</div>
                  <div>{selectedDocument.exp.destination}</div>
                </div>
              </div>

              <div className="border-t border-b py-2 flex justify-between">
                <span>RÉF : {selectedDocument.exp.ref}</span>
                <span>POIDS : {selectedDocument.exp.poids}</span>
              </div>

              {selectedDocument.type === "preuve" ? (
                <div className="p-3 bg-slate-50 rounded border text-center space-y-1">
                  <div className="text-green-700 font-bold">COLIS LIVRÉ ET RÉCEPTIONNÉ</div>
                  <div className="text-[10px] text-slate-500">Date : {selectedDocument.exp.arrivee}</div>
                  <div className="text-[10px] font-sans italic text-slate-600 mt-2">Signature électronique certifiée enregistrée</div>
                </div>
              ) : (
                <div className="text-center py-2 space-y-1">
                  <div className="text-2xl tracking-widest">||| | |||| || ||| |||||</div>
                  <div className="text-[10px] text-slate-500">N° {selectedDocument.exp.ref}</div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-xs px-4 py-2 rounded-xl"
                style={{ background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="text-xs px-4 py-2 rounded-xl text-white font-medium"
                style={{ background: "#4338CA" }}
              >
                🖨️ Imprimer le document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}