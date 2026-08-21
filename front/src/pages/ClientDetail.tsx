import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../services/api.service";
import type { ClientMock } from "./Client";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const initials = (nom?: string) =>
  nom ? nom.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "U";

const AVATAR_COLORS = ["#0C447C", "#3C3489", "#085041", "#633806", "#791F1F", "#185FA5", "#27500A"];

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientMock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const enterprises = await apiService.getEnterprises();
        const found = enterprises.find((e: any) => e.id === id);
        if (found) {
          setClient({
            id: found.id,
            nom: found.name,
            type: found.type,
            email: found.email,
            tel: found.phone,
            ville: found.city,
            pays: found.country,
            since: found.createdAt ? String(found.createdAt).slice(0, 7) : "",
            expeditions: 0,
            ca: 0,
            actif: found.status !== false,
            tva: found.vatNumber,
            recentShipments: [],
          });
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchClientDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 space-y-4 text-center">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement des détails du client...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 space-y-4 text-center">
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Client introuvable</h2>
        <p style={{ color: "var(--text-muted)" }}>Aucun client ne correspond à l'identifiant "{id}".</p>
        <button
          onClick={() => navigate("/clients")}
          className="px-4 py-2 text-sm font-medium rounded-xl border cursor-pointer"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
        >
          ← Retour à la liste
        </button>
      </div>
    );
  }

  const avatarBg = AVATAR_COLORS[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/clients")}
          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border cursor-pointer transition-colors"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
        >
          ← Retour aux clients
        </button>
      </div>

      <div
        className="p-6 rounded-2xl space-y-6 relative overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm"
              style={{ background: avatarBg + "22", color: avatarBg }}
            >
              {initials(client.nom)}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {client.nom}
                </h1>
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                  style={
                    client.actif
                      ? { background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }
                      : { background: "rgba(239, 68, 68, 0.15)", color: "#EF4444" }
                  }
                >
                  {client.actif ? "● Actif" : "○ Inactif"}
                </span>
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium border"
                  style={{ background: "var(--bg-hover)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  {client.type}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                ID Client: <span className="font-mono">{client.id}</span> · Client depuis {client.since}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Numéro de TVA</p>
            <p className="text-sm font-mono font-semibold" style={{ color: "var(--text-primary)" }}>{client.tva}</p>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              Contact Principal
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{client.contactPerson}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>✉ {client.email}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>☎ {client.tel}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              Adresse du Siège
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {client.rue} {client.numero}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {client.codePostal} {client.ville}, {client.pays}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              Statut Logistique
            </p>
            <p className="text-sm font-medium text-emerald-500">Compte Client Uniship</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-5 rounded-2xl space-y-1"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Chiffre d'Affaires Total</p>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{fmt(client.ca)}</p>
        </div>

        <div
          className="p-5 rounded-2xl space-y-1"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Total Expéditions</p>
          <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{client.expeditions}</p>
        </div>

        <div
          className="p-5 rounded-2xl space-y-1"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Panier Moyen / Envoi</p>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {client.expeditions > 0 ? fmt(Math.round(client.ca / client.expeditions)) : fmt(0)}
          </p>
        </div>
      </div>

      <div
        className="p-6 rounded-2xl space-y-4"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            Dernières Expéditions Client
          </h2>
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {client.recentShipments ? client.recentShipments.length : 0} expédition(s) récente(s)
          </span>
        </div>

        {client.recentShipments && client.recentShipments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                  <th className="py-2.5 px-3 font-semibold">Réf. Colis</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Destination</th>
                  <th className="py-2.5 px-3 font-semibold">Statut</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {client.recentShipments.map((ship) => (
                  <tr key={ship.id} className="border-b transition-colors" style={{ borderColor: "var(--border)" }}>
                    <td className="py-3 px-3 font-mono font-semibold" style={{ color: "var(--accent)" }}>{ship.id}</td>
                    <td className="py-3 px-3" style={{ color: "var(--text-muted)" }}>{ship.date}</td>
                    <td className="py-3 px-3 font-medium" style={{ color: "var(--text-primary)" }}>{ship.destination}</td>
                    <td className="py-3 px-3">
                      <span
                        className="px-2 py-0.5 rounded-full font-medium text-[11px]"
                        style={
                          ship.status === "Livré"
                            ? { background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }
                            : { background: "rgba(242, 122, 23, 0.15)", color: "#F27A17" }
                        }
                      >
                        {ship.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>
                      {fmt(ship.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs italic p-4 text-center" style={{ color: "var(--text-muted)" }}>
            Aucune expédition récente enregistrée pour ce client.
          </p>
        )}
      </div>
    </div>
  );
}
