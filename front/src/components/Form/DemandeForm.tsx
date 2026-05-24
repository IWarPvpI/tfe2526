import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

interface Adresse {
    rue: string;
    numero: string;
    bte: string;
    codePostal: string;
    pays: string;
}

interface DemandeFormProps {
    onClose: () => void;
    onSubmit: (data: {
        client: string;
        origine: Adresse;
        destination: Adresse;
        date: string;          
        livraisonDate: string; 
        poids: string;
    }) => void;
}

const PAYS_LIMITROPHES = [
    { code: "FR", translationKey: "countries.france" },
    { code: "NL", translationKey: "countries.netherlands" },
    { code: "DE", translationKey: "countries.germany" },
    { code: "LU", translationKey: "countries.luxembourg" },
    { code: "GB", translationKey: "countries.united_kingdom" },
    { code: "IT", translationKey: "countries.italy" },
    { code: "ES", translationKey: "countries.spain" }
];

const LISTE_CLIENTS = ["Dupont SA", "Durand Logistique", "Janssen Pharmaceutica", "Colruyt Group"];

const ADRESSES_CLIENTS: Record<string, Adresse[]> = {
    "Dupont SA": [
        { rue: "Rue du Progrès", numero: "10", bte: "A", codePostal: "1000", pays: "Belgique" },
        { rue: "Antwerpsesteenweg", numero: "45", bte: "", codePostal: "2000", pays: "Belgique" },
        { rue: "Rue de la Station", numero: "5", bte: "", codePostal: "1410", pays: "Belgique" },
        { rue: "Rue de l'Industrie", numero: "28", bte: "B3", codePostal: "4000", pays: "Belgique" },
        { rue: "Avenue de la République", numero: "142", bte: "", codePostal: "59000", pays: "France" }
    ],
    "Colruyt Group": [
        { rue: "Edingensesteenweg", numero: "196", bte: "", codePostal: "1500", pays: "Belgique" },
        { rue: "Grote Markt", numero: "1", bte: "", codePostal: "1000", pays: "Belgique" },
        { rue: "Zinkstraat", numero: "8", bte: "", codePostal: "1502", pays: "Belgique" },
        { rue: "Boulevard de l'Europe", numero: "77", bte: "12", codePostal: "1300", pays: "Belgique" },
        { rue: "Keizersgracht", numero: "421", bte: "", codePostal: "1016 EK", pays: "Pays-Bas" }
    ],
    "Durand Logistique": [
        { rue: "Rue des Artisans", numero: "14", bte: "", codePostal: "6000", pays: "Belgique" },
        { rue: "Kortrijksesteenweg", numero: "302", bte: "A", codePostal: "9000", pays: "Belgique" },
        { rue: "Avenue Destenay", numero: "8", bte: "", codePostal: "4000", pays: "Belgique" },
        { rue: "Rue Neuve", numero: "55", bte: "2", codePostal: "1000", pays: "Belgique" },
        { rue: "Hauptstraße", numero: "12", bte: "", codePostal: "50667", pays: "Allemagne" }
    ],
    "Janssen Pharmaceutica": [
        { rue: "Turnhoutseweg", numero: "30", bte: "", codePostal: "2340", pays: "Belgique" },
        { rue: "Hochstrasse", numero: "104", bte: "", codePostal: "4700", pays: "Belgique" },
        { rue: "Rue de l'Ancre", numero: "2", bte: "", codePostal: "7100", pays: "Belgique" },
        { rue: "Namursesteenweg", numero: "65", bte: "C", codePostal: "3000", pays: "Belgique" },
        { rue: "Route d'Arlon", numero: "18", bte: "", codePostal: "1150", pays: "Luxembourg" }
    ]
};

const initialAdresse = (): Adresse => ({
    rue: "",
    numero: "",
    bte: "",
    codePostal: "",
    pays: "Belgique",
});

export default function DemandeForm({ onClose, onSubmit }: DemandeFormProps) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const isClient = user?.role === "client";

    const [client, setClient] = useState(isClient ? "Dupont SA" : "");
    const [ancienClient, setAncienClient] = useState(client);
    const [date, setDate] = useState("");
    const [livraisonDate, setLivraisonDate] = useState("");
    const [poids, setPoids] = useState("");
    const [origine, setOrigine] = useState<Adresse>(initialAdresse());
    const [destination, setDestination] = useState<Adresse>(initialAdresse());
    const [adressesDisponibles, setAdressesDisponibles] = useState<Adresse[]>([]);

    const [sauvegarderOrigine, setSauvegarderOrigine] = useState(false);
    const [sauvegarderDestination, setSauvegarderDestination] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        if (client && ADRESSES_CLIENTS[client]) {
            setAdressesDisponibles(ADRESSES_CLIENTS[client]);
        } else {
            setAdressesDisponibles([]);
        }

        if (client !== ancienClient) {
            setOrigine(initialAdresse());
            setDestination(initialAdresse());
            setSauvegarderOrigine(false);
            setSauvegarderDestination(false);
            setAncienClient(client);
        }
    }, [client, ancienClient]);

    const isBelgianZip = (zip: string) => /^[0-9]{4}$/.test(zip.trim());

    const sontAdressesIdentiques = (addr1: Adresse, addr2: Adresse) => {
        return (
            addr1.rue.toLowerCase().trim() === addr2.rue.toLowerCase().trim() &&
            addr1.numero.trim() === addr2.numero.trim() &&
            addr1.codePostal.trim() === addr2.codePostal.trim() &&
            addr1.pays.toLowerCase().trim() === addr2.pays.toLowerCase().trim()
        );
    };

    const estAdresseRemplie = (addr: Adresse) => {
        return addr.rue.trim() !== "" && addr.numero.trim() !== "" && addr.codePostal.trim() !== "";
    };

    const handleAdresseChange = (type: "origine" | "destination", field: keyof Adresse, value: string) => {
        const updater = type === "origine" ? setOrigine : setDestination;
        updater((prev) => {
            const updated = { ...prev, [field]: value };
            if (field === "codePostal") {
                if (isBelgianZip(value)) {
                    updated.pays = "Belgique";
                } else if (value.trim() === "") {
                    updated.pays = "Belgique";
                }
            }
            return updated;
        });
    };

    const handleSwitchAdresses = () => {
        const tempOrigine = { ...origine };
        setOrigine(destination);
        setDestination(tempOrigine);

        const tempSave = sauvegarderOrigine;
        setSauvegarderOrigine(sauvegarderDestination);
        setSauvegarderDestination(tempSave);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (livraisonDate < date) {
            alert(t("demandes.errors.invalid_delivery_date", "La date de livraison ne peut pas être antérieure à la date de chargement."));
            return;
        }

        if (client && LISTE_CLIENTS.includes(client)) {
            if (!ADRESSES_CLIENTS[client]) {
                ADRESSES_CLIENTS[client] = [];
            }
            if (sauvegarderOrigine && estAdresseRemplie(origine)) {
                ADRESSES_CLIENTS[client].push({ ...origine });
            }
            if (sauvegarderDestination && estAdresseRemplie(destination)) {
                ADRESSES_CLIENTS[client].push({ ...destination });
            }
        }

        onSubmit({ client, origine, destination, date, livraisonDate, poids });
    };

    return (
        <div 
            onClick={onClose} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto cursor-pointer"
        >
            <div
                onClick={(e) => e.stopPropagation()} 
                className="w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150 cursor-default"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    {t("demandes.new_request")}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isClient && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("demandes.client")}</label>
                            <input
                                type="text" required list="clients-list" value={client}
                                onChange={(e) => setClient(e.target.value)}
                                placeholder={t("demandes.searchClient")}
                                className="px-3 py-2 rounded-xl text-sm outline-none border border-[var(--border)] bg-[var(--bg-app)]"
                                style={{ color: "var(--text-primary)" }}
                            />
                            <datalist id="clients-list">
                                {LISTE_CLIENTS.map((nom, idx) => <option key={idx} value={nom} />)}
                            </datalist>
                        </div>
                    )}

                    {/* Bloc Origine */}
                    <RenderAdresseFields 
                        type="origine" 
                        title={t("demandes.origin")}
                        data={origine}
                        lAutreData={destination}
                        setter={setOrigine}
                        isChecked={sauvegarderOrigine}
                        setIsChecked={setSauvegarderOrigine}
                        adressesDisponibles={adressesDisponibles}
                        client={client}
                        onAdresseChange={handleAdresseChange}
                        sontAdressesIdentiques={sontAdressesIdentiques}
                        estAdresseRemplie={estAdresseRemplie}
                        isBelgianZip={isBelgianZip}
                        t={t}
                    />

                    {/* Bouton Switch */}
                    <div className="flex justify-center -my-2 relative z-10">
                        <button
                            type="button"
                            onClick={handleSwitchAdresses}
                            title="Inverser départ et arrivée"
                            className="p-2 rounded-full border shadow-md bg-[var(--bg-surface)] border-[var(--border)] hover:bg-[var(--bg-hover)] transition-all transform active:scale-90"
                            style={{ color: "var(--accent)" }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                        </button>
                    </div>

                    {/* Bloc Destination */}
                    <RenderAdresseFields 
                        type="destination" 
                        title={t("demandes.destination")}
                        data={destination}
                        lAutreData={origine}
                        setter={setDestination}
                        isChecked={sauvegarderDestination}
                        setIsChecked={setSauvegarderDestination}
                        adressesDisponibles={adressesDisponibles}
                        client={client}
                        onAdresseChange={handleAdresseChange}
                        sontAdressesIdentiques={sontAdressesIdentiques}
                        estAdresseRemplie={estAdresseRemplie}
                        isBelgianZip={isBelgianZip}
                        t={t}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("demandes.date")}</label>
                            <input
                                type="date" required value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    if (livraisonDate && e.target.value > livraisonDate) {
                                        setLivraisonDate(e.target.value);
                                    }
                                }}
                                className="px-3 py-2 rounded-xl text-sm outline-none border border-[var(--border)] bg-[var(--bg-app)]"
                                style={{ color: "var(--text-primary)" }}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("demandes.delivery_date")}</label>
                            <input
                                type="date" required value={livraisonDate}
                                min={date}
                                onChange={(e) => setLivraisonDate(e.target.value)}
                                className="px-3 py-2 rounded-xl text-sm outline-none border border-[var(--border)] bg-[var(--bg-app)]"
                                style={{ color: "var(--text-primary)" }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("demandes.weight")} (kg)</label>
                        <input
                            type="number" required min="1" value={poids} onChange={(e) => setPoids(e.target.value)}
                            className="px-3 py-2 rounded-xl text-sm outline-none border border-[var(--border)] bg-[var(--bg-app)]"
                            style={{ color: "var(--text-primary)" }}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button" onClick={onClose}
                            className="px-4 py-2 text-sm font-medium rounded-xl border border-[var(--border)] bg-[var(--bg-hover)]"
                            style={{ color: "var(--text-primary)" }}
                        >
                            {t("common.cancel")}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium rounded-xl transition-opacity hover:opacity-95"
                            style={{ background: "var(--accent)", color: "#fff" }}
                        >
                            {t("common.create")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// INTERFACE POUR LES PROPS DU SOUS-COMPOSANT
interface RenderAdresseFieldsProps {
    type: "origine" | "destination";
    title: string;
    data: Adresse;
    lAutreData: Adresse;
    setter: React.Dispatch<React.SetStateAction<Adresse>>;
    isChecked: boolean;
    setIsChecked: React.Dispatch<React.SetStateAction<boolean>>;
    adressesDisponibles: Adresse[];
    client: string;
    onAdresseChange: (type: "origine" | "destination", field: keyof Adresse, value: string) => void;
    sontAdressesIdentiques: (addr1: Adresse, addr2: Adresse) => boolean;
    estAdresseRemplie: (addr: Adresse) => boolean;
    isBelgianZip: (zip: string) => boolean;
    t: any;
}

// LE COMPOSANT EST MAINTENANT COMPLÈTEMENT SORTI DE L'AUTRE COMPOSANT
function RenderAdresseFields({
    type,
    title,
    data,
    lAutreData,
    setter,
    isChecked,
    setIsChecked,
    adressesDisponibles,
    client,
    onAdresseChange,
    sontAdressesIdentiques,
    estAdresseRemplie,
    isBelgianZip,
    t
}: RenderAdresseFieldsProps) {
    
    const zipClean = data.codePostal.trim();
    const showPaysInput = zipClean.length > 0 && (!isBelgianZip(zipClean) && (zipClean.length >= 4 || /\D/.test(zipClean)));

    const adressesFiltrees = adressesDisponibles.filter(
        (adr) => !sontAdressesIdentiques(adr, lAutreData)
    );

    const existeDeja = adressesDisponibles.some((adr) => sontAdressesIdentiques(adr, data));
    const afficherOptionSauvegarde = client && estAdresseRemplie(data) && !existeDeja;

    return (
        <div className="space-y-2 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-app)] relative">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    {title}
                </span>

                {adressesDisponibles.length > 0 && (
                    <select
                        onChange={(e) => {
                            const idx = parseInt(e.target.value);
                            if (!isNaN(idx)) setter({ ...adressesFiltrees[idx] });
                        }}
                        className="text-xs px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-surface)] outline-none max-w-[200px] cursor-pointer"
                        style={{ color: "var(--text-primary)" }}
                        value=""
                    >
                        <option value="" disabled hidden>📋 {t("demandes.adresse.saved_addresses")}</option>
                        {adressesFiltrees.map((adr, index) => (
                            <option key={index} value={index}>
                                {adr.rue} {adr.numero}, {adr.codePostal}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t("demandes.adresse.street")}</label>
                    <input
                        type="text" required value={data.rue}
                        onChange={(e) => onAdresseChange(type, "rue", e.target.value)}
                        className="px-2 py-1.5 rounded-lg text-sm outline-none border border-[var(--border)] bg-[var(--bg-surface)]"
                        style={{ color: "var(--text-primary)" }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t("demandes.adresse.number")}</label>
                    <input
                        type="text" required value={data.numero}
                        onChange={(e) => onAdresseChange(type, "numero", e.target.value)}
                        className="px-2 py-1.5 rounded-lg text-sm outline-none border border-[var(--border)] bg-[var(--bg-surface)]"
                        style={{ color: "var(--text-primary)" }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                    <label className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t("demandes.adresse.box")}</label>
                    <input
                        type="text" value={data.bte}
                        onChange={(e) => onAdresseChange(type, "bte", e.target.value)}
                        className="px-2 py-1.5 rounded-lg text-sm outline-none border border-[var(--border)] bg-[var(--bg-surface)]"
                        style={{ color: "var(--text-primary)" }}
                    />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t("demandes.adresse.zip")}</label>
                    <input
                        type="text" required value={data.codePostal}
                        onChange={(e) => onAdresseChange(type, "codePostal", e.target.value)}
                        placeholder={t("demandes.adresse.zip_placeholder")}
                        className="px-2 py-1.5 rounded-lg text-sm outline-none border border-[var(--border)] bg-[var(--bg-surface)]"
                        style={{ color: "var(--text-primary)" }}
                    />
                </div>
            </div>

            {showPaysInput && (
                <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-[11px] font-medium text-amber-600 dark:text-amber-400">{t("demandes.adresse.foreign_country_required")}</label>
                    <select
                        required value={data.pays === "Belgique" ? "" : data.pays}
                        onChange={(e) => onAdresseChange(type, "pays", e.target.value)}
                        className="px-2 py-1.5 rounded-lg text-sm outline-none border border-amber-300 dark:border-amber-700 bg-[var(--bg-surface)] cursor-pointer"
                        style={{ color: "var(--text-primary)" }}
                    >
                        <option value="" disabled hidden>{t("demandes.adresse.select_country")}</option>
                        {PAYS_LIMITROPHES.map((p) => (
                            <option key={p.code} value={t(p.translationKey)}>{t(p.translationKey)}</option>
                        ))}
                        <option value="Autre">{t("countries.other")}</option>
                    </select>
                </div>
            )}

            {afficherOptionSauvegarde && (
                <div className="flex items-center gap-2 pt-1.5 px-0.5 animate-in fade-in duration-200">
                    <input
                        type="checkbox"
                        id={`save-address-${type}`}
                        checked={isChecked}
                        onChange={(e) => setIsChecked(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-[var(--border)] accent-[var(--accent)] bg-[var(--bg-surface)] cursor-pointer"
                    />
                    <label 
                        htmlFor={`save-address-${type}`} 
                        className="text-[11px] select-none cursor-pointer font-medium"
                        style={{ color: "var(--accent)" }}
                    >
                        💾 {t("demandes.adresse.save_this_address", "Sauvegarder cette adresse pour ce client")}
                    </label>
                </div>
            )}
        </div>
    );
}