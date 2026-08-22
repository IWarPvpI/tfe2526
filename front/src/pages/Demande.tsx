import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import DemandeForm from "../components/Form/DemandeForm";
import { apiService } from "../services/api.service";

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

const STATUS_STYLE: Record<Status, { label: string; bg: string; color: string }> = {
    en_attente: { label: "demandes.status.pending", bg: "#FAEEDA", color: "#633806" },
    approuvee: { label: "demandes.status.approved", bg: "#EAF3DE", color: "#27500A" },
    en_cours: { label: "demandes.status.in_progress", bg: "#E6F1FB", color: "#0C447C" },
    livree: { label: "demandes.status.delivered", bg: "#E1F5EE", color: "#085041" },
    annulee: { label: "demandes.status.cancelled", bg: "#FCEBEB", color: "#791F1F" },
};

export default function Demandes() {
    const { isAtLeast } = useAuth();
    const { t } = useTranslation();
    
    const [requests, setRequests] = useState<Demande[]>([]);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<Status | "">("");
    const [isFormVisible, setIsFormVisible] = useState(false);

    const fetchDemandes = async () => {
        try {
            const data = await apiService.getExpeditions();
            if (Array.isArray(data)) {
                const mapped: Demande[] = data.map((r: any) => {
                    const clientName = r.user?.enterprise?.name
                        ? r.user.enterprise.name
                        : r.user?.firstName
                        ? `${r.user.firstName} ${r.user.lastName}`
                        : r.shippingDetails?.client
                        ? r.shippingDetails.client
                        : "Client";

                    const origineCity = r.shippingDetails?.origine?.city
                        ? r.shippingDetails.origine.city
                        : r.shippingDetails?.origine?.street
                        ? r.shippingDetails.origine.street
                        : "Origine";

                    const destCity = r.shippingDetails?.destination?.city
                        ? r.shippingDetails.destination.city
                        : r.shippingDetails?.destination?.street
                        ? r.shippingDetails.destination.street
                        : "Destination";

                    const dateStr = r.shippingDetails?.date
                        ? r.shippingDetails.date
                        : r.createdAt
                        ? String(r.createdAt).slice(0, 10)
                        : "";

                    const poidsStr = r.shippingDetails?.poids
                        ? `${r.shippingDetails.poids} kg`
                        : "-";

                    let statusVal: Status = "en_attente";
                    if (r.status === "CONFIRMED") statusVal = "approuvee";
                    else if (r.status === "IN_TRANSIT") statusVal = "en_cours";
                    else if (r.status === "DELIVERED") statusVal = "livree";
                    else if (r.status === "CANCELLED") statusVal = "annulee";

                    return {
                        id: r.id ? `DEM-${r.id.slice(0, 8).toUpperCase()}` : "DEM-000",
                        client: clientName,
                        origine: origineCity,
                        destination: destCity,
                        date: dateStr,
                        poids: poidsStr,
                        status: statusVal,
                    };
                });
                setRequests(mapped);
            }
        } catch {
        }
    };

    useEffect(() => {
        fetchDemandes();
    }, []);

    const filteredData = useMemo(() => {
        const normalizedSearch = search.toLowerCase().trim();
        return requests.filter((d) => {
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
    }, [search, filterStatus, requests]);

    const handleCreateDemande = async () => {
        await fetchDemandes();
        setIsFormVisible(false);
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {t("nav.demandes")}
                </h2>
                <button
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                    style={{ background: "var(--accent)", color: "#fff" }}
                >
                    {isFormVisible ? t("common.close") : t("demandes.new_request")}
                </button>
            </div>

            {isFormVisible && (
                <div className="flex justify-center py-4">
                    <DemandeForm 
                        onSubmit={handleCreateDemande} 
                    />
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                <input
                    type="text" placeholder={t("demandes.search")}
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)", width: "220px" }}
                />
                <select
                    value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as Status | "")}
                    className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                >
                    <option value="">{t("demandes.all_statuses")}</option>
                    {Object.keys(STATUS_STYLE).map((s) => (
                        <option key={s} value={s}>{t(STATUS_STYLE[s as Status].label)}</option>
                    ))}
                </select>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
                            <tr>
                                {["Réf.", "Client", "Origine", "Destination", "Date", "Poids", "Statut", ""].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }}>Aucun résultat</td></tr>
                            ) : (
                                filteredData.map((d, i) => {
                                    const s = STATUS_STYLE[d.status];
                                    return (
                                        <tr key={d.id} className="transition-colors" style={{ background: i % 2 === 0 ? "var(--bg-app)" : "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
                                            <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{d.id}</td>
                                            <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{d.client}</td>
                                            <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{d.origine}</td>
                                            <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{d.destination}</td>
                                            <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{d.date}</td>
                                            <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{d.poids}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.color }}>{t(s.label)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {isAtLeast("admin") && (
                                                    <button className="text-xs px-3 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg-hover)]" style={{ color: "var(--text-primary)" }}>Modifier</button>
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
        </div>
    );
}
