import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api.service";

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
  const [showModal, setShowModal] = useState(false);
  const [clientsList, setClientsList] = useState<ClientMock[]>([]);

  const [newClient, setNewClient] = useState({
    nom: "",
    type: "SA" as "SA" | "SPRL" | "NV" | "SCS" | "Indépendant",
    email: "",
    tel: "",
    ville: "",
    pays: "Belgique",
    tva: "",
  });

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.nom) return;

    try {
      await apiService.createEnterprise({
        name: newClient.nom,
        email: newClient.email,
        phone: newClient.tel,
        type: newClient.type,
        city: newClient.ville,
        country: newClient.pays,
        vatNumber: newClient.tva,
      });
      await fetchClient();
    } catch (err) {
    }

    setShowModal(false);
    setNewClient({ nom: "", type: "SA", email: "", tel: "", ville: "", pays: "Belgique", tva: "" });
  };

  const fetchClient = async () => {
    try {
      const data = await apiService.getEnterprises();
      if (Array.isArray(data)) {
        const mapped: ClientMock[] = data.map((e: any) => ({
          id: e.id,
          nom: e.name,
          type: e.type,
          email: e.email,
          tel: e.phone,
          ville: e.city,
          pays: e.country,
          since: e.createdAt ? String(e.createdAt).slice(0, 7) : "",
          expeditions: 0,
          ca: 0,
          actif: e.status !== false,
          tva: e.vatNumber,
        }));
        setClientsList(mapped);
      }
    } catch (e) {
    }
  };

  useEffect(() => {
    fetchClient();
  }, []);

  const data = clientsList
    .filter((c) => filterActif !== "" ? String(c.actif) === filterActif : true)
    .filter((c) =>
      [c.nom, c.email, c.ville, c.id].join(" ").toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Gestion des Clients</h1>

        {isAtLeast("admin") && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-opacity hover:opacity-90"
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

      {/* MODAL CRÉATION NOUVEAU CLIENT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md p-6 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Nouveau Client Entreprise</h2>
              <button onClick={() => setShowModal(false)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Nom de la Société *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Dupont SA"
                  value={newClient.nom}
                  onChange={(e) => setNewClient({ ...newClient, nom: e.target.value })}
                  className="px-3 py-2 rounded-xl text-sm outline-none border bg-[var(--bg-app)]"
                  style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Forme Juridique</label>
                  <select
                    value={newClient.type}
                    onChange={(e) => setNewClient({ ...newClient, type: e.target.value as any })}
                    className="px-3 py-2 rounded-xl text-sm outline-none border bg-[var(--bg-app)] cursor-pointer"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                  >
                    <option value="SA">SA</option>
                    <option value="SPRL">SPRL</option>
                    <option value="NV">NV</option>
                    <option value="SCS">SCS</option>
                    <option value="Indépendant">Indépendant</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>N° TVA (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="BE 0123.456.789"
                    value={newClient.tva}
                    onChange={(e) => setNewClient({ ...newClient, tva: e.target.value })}
                    className="px-3 py-2 rounded-xl text-sm outline-none border bg-[var(--bg-app)]"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Email Contact</label>
                  <input
                    type="email"
                    placeholder="contact@societe.be"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="px-3 py-2 rounded-xl text-sm outline-none border bg-[var(--bg-app)]"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Téléphone</label>
                  <input
                    type="text"
                    placeholder="+32 2 123 45 67"
                    value={newClient.tel}
                    onChange={(e) => setNewClient({ ...newClient, tel: e.target.value })}
                    className="px-3 py-2 rounded-xl text-sm outline-none border bg-[var(--bg-app)]"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Ville</label>
                  <input
                    type="text"
                    placeholder="Bruxelles"
                    value={newClient.ville}
                    onChange={(e) => setNewClient({ ...newClient, ville: e.target.value })}
                    className="px-3 py-2 rounded-xl text-sm outline-none border bg-[var(--bg-app)]"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Pays</label>
                  <input
                    type="text"
                    placeholder="Belgique"
                    value={newClient.pays}
                    onChange={(e) => setNewClient({ ...newClient, pays: e.target.value })}
                    className="px-3 py-2 rounded-xl text-sm outline-none border bg-[var(--bg-app)]"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border cursor-pointer"
                  style={{ background: "var(--bg-hover)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl shadow-md cursor-pointer transition-opacity hover:opacity-90"
                  style={{ background: "var(--accent)", color: "#ffffff" }}
                >
                  Enregistrer Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}