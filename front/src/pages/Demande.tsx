import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import DemandeForm from "../components/Form/DemandeForm"; // Import du nouveau sous-composant

type Status = "en_attente" | "approuvee" | "en_cours" | "livree" | "annulee";

interface Demande {
    id: string;
    client: string;
    origine: string;
    destination: string;
    date: string;
    poids: string;
    status: Status;
}

const INITIAL_MOCK: Demande[] = [
    { id: "DEM-001", client: "Dupont SA", origine: "Bruxelles", destination: "Paris", date: "2024-05-01", poids: "120 kg", status: "en_attente" },
    { id: "DEM-002", client: "Leroy SPRL", origine: "Gand", destination: "Amsterdam", date: "2024-05-03", poids: "340 kg", status: "approuvee" },
    { id: "DEM-003", client: "Martin & Co", origine: "Liège", destination: "Londres", date: "2024-05-05", poids: "80 kg", status: "en_cours" },
    { id: "DEM-004", client: "Verbeke NV", origine: "Anvers", destination: "Berlin", date: "2024-05-07", poids: "210 kg", status: "livree" },
    { id: "DEM-005", client: "Duchêne SCS", origine: "Namur", destination: "Lyon", date: "2024-05-08", poids: "55 kg", status: "annulee" },
    { id: "DEM-006", client: "Claes Import", origine: "Bruxelles", destination: "Madrid", date: "2024-05-10", poids: "430 kg", status: "en_attente" },
    { id: "DEM-007", client: "Peeters Logics", origine: "Bruges", destination: "Rotterdam", date: "2024-05-11", poids: "175 kg", status: "approuvee" },
    { id: "DEM-008", client: "Dupont SA", origine: "Bruxelles", destination: "Francfort", date: "2024-05-12", poids: "95 kg", status: "en_cours" },
];

const STATUS_STYLE: Record<Status, { label: string; bg: string; color: string }> = {
    en_attente: { label: "demandes.status.pending", bg: "#FAEEDA", color: "#633806" },
    approuvee: { label: "demandes.status.approved", bg: "#EAF3DE", color: "#27500A" },
    en_cours: { label: "demandes.status.in_progress", bg: "#E6F1FB", color: "#0C447C" },
    livree: { label: "demandes.status.delivered", bg: "#E1F5EE", color: "#085041" },
    annulee: { label: "demandes.status.cancelled", bg: "#FCEBEB", color: "#791F1F" },
};

const ALL_STATUSES: Status[] = ["en_attente", "approuvee", "en_cours", "livree", "annulee"];

export default function Demandes() {
    const { user, isAtLeast, hasPermission } = useAuth();
    const { t } = useTranslation();
    
    const [requests, setRequests] = useState<Demande[]>(INITIAL_MOCK);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<Status | "">("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filtrage optimisé des demandes
    const filteredData = useMemo(() => {
        const normalizedSearch = search.toLowerCase().trim();

        return requests.filter((d) => {
            const matchesClient = user?.role === "client" ? d.client === "Dupont SA" : true;
            if (!matchesClient) return false;

            const matchesStatus = filterStatus ? d.status === filterStatus : true;
            if (!matchesStatus) return false;

            if (normalizedSearch) {
                return (
                    d.id.toLowerCase().includes(normalizedSearch) ||
                    d.client.toLowerCase().includes(normalizedSearch) ||
                    d.origine.toLowerCase().includes(normalizedSearch) ||
                    d.destination.toLowerCase().includes(normalizedSearch)
                );
            }

            return true;
        });
    }, [search, filterStatus, user, requests]);

    const canEdit = (d: Demande) =>
        isAtLeast("admin") ||
        (isAtLeast("employee") && hasPermission(`canEditDelivery:${d.id}`));

    // Callback exécuté à la soumission du DemandeForm
    const handleCreateDemande = (formData: { client: string; origine: string; destination: string; date: string; poids: string }) => {
        const newId = `DEM-${String(requests.length + 1).padStart(3, "0")}`;
        const createdItem: Demande = {
            id: newId,
            client: formData.client,
            origine: formData.origine,
            destination: formData.destination,
            date: formData.date,
            poids: `${formData.poids} kg`,
            status: "en_attente",
        };

        setRequests([createdItem, ...requests]);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {t("nav.demandes")}
                </h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-95"
                    style={{ background: "var(--accent)", color: "#fff" }}
                >
                    {t("demandes.new_request")}
                </button>
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-3">
                <input
                    type="text"
                    placeholder={t("demandes.search")}
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
                    onChange={(e) => setFilterStatus(e.target.value as Status | "")}
                    className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
                    style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                    }}
                >
                    <option value="">{t("demandes.all_statuses")}</option>
                    {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {t(STATUS_STYLE[s].label)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tableau */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
                                {["Réf.", "Client", "Origine", "Destination", "Date", "Poids", "Statut", ""].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }}>
                                        Aucun résultat
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((d, i) => {
                                    const s = STATUS_STYLE[d.status];
                                    return (
                                        <tr
                                            key={d.id}
                                            className="transition-colors"
                                            style={{
                                                background: i % 2 === 0 ? "var(--bg-app)" : "var(--bg-surface)",
                                                borderBottom: "1px solid var(--border)",
                                            }}
                                        >
                                            <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{d.id}</td>
                                            <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{d.client}</td>
                                            <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{d.origine}</td>
                                            <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{d.destination}</td>
                                            <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{d.date}</td>
                                            <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{d.poids}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span
                                                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                                                    style={{ background: s.bg, color: s.color }}
                                                >
                                                    {t(s.label)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {canEdit(d) && (
                                                    <button
                                                        className="text-xs px-3 py-1 rounded-lg transition-colors hover:opacity-80"
                                                        style={{
                                                            background: "var(--bg-hover)",
                                                            color: "var(--text-primary)",
                                                            border: "1px solid var(--border)",
                                                        }}
                                                    >
                                                        Modifier
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Compteur */}
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {filteredData.length} résultat{filteredData.length > 1 ? "s" : ""}
            </p>

            {/* Modal de création déporté */}
            {isModalOpen && (
                <DemandeForm 
                    onClose={() => setIsModalOpen(false)} 
                    onSubmit={handleCreateDemande} 
                />
            )}
        </div>
    );
}