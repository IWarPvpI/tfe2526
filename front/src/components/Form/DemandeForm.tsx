import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useDemandeForm } from "../../hooks/useDemandeForm";
import type { ApiError } from "../../types/api.types";

interface Adresse {
    rue: string;
    numero: string;
    bte: string;
    codePostal: string;
    pays: string;
}

interface FedexOption {
    serviceType: string;
    serviceName: string;
    totalNetCharge: number;
    currency: string;
}

interface FedexResponse {
    transactionId: string;
    options: FedexOption[];
    quoteDate: string;
}

interface DemandeFormProps {
    onClose?: () => void;
    onSubmit: (data: any) => void;
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
    ],
};

export default function DemandeForm({ onClose, onSubmit }: DemandeFormProps) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const isClient = user?.role === "client";

    const { state, actions, utils } = useDemandeForm(user?.role, "Dupont SA");
    const { client, date, livraisonDate, poids, origine, destination, adressesDisponibles, step, rates, loading, selectedOption } = state;

    const aujourdhui = new Date();
    const demainObj = new Date(aujourdhui);
    demainObj.setDate(aujourdhui.getDate() + 1);
    const demainStr = demainObj.toISOString().split("T")[0];

    useEffect(() => {
        if (client && ADRESSES_CLIENTS[client]) {
            actions.setAdressesDisponibles(ADRESSES_CLIENTS[client]);
        } else {
            actions.setAdressesDisponibles([]);
        }
    }, [client, actions.setAdressesDisponibles]);

    const handleFetchRates = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await actions.fetchRates(demainStr);
        } catch (error: any) {
            if (error.message === "INVALID_START_DATE") {
                alert(t("demandes.errors.invalid_start_date"));
            } else {
                const apiError = error as ApiError;
                console.error("FetchRates Error:", apiError);
                alert(`❌ ${apiError.message || "Erreur lors de la récupération des tarifs"}`);
            }
        }
    };

    const handleConfirmOption = async () => {
        if (!selectedOption) return;
        try {
            await actions.confirmOption();
            onSubmit({ client, origine, destination, date, livraisonDate, poids, selectedOption });
            actions.resetForm();
        } catch (e: any) {
            const apiError = e as ApiError;
            alert(`❌ ${apiError.message || "Erreur lors de la confirmation"}`);
        }
    };

    if (step === 'results' && rates) {
        return (
            <div className="w-full max-w-2xl p-6 rounded-2xl shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300" 
                 style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                        {t("demandes.available_rates", "Tarifs disponibles")}
                    </h3>
                    <button onClick={() => actions.setStep('form')} className="text-xs text-[var(--accent)] hover:underline">
                        Modifier la demande
                    </button>
                </div>

                <div className="grid gap-3">
                    {rates.options.map((opt, i) => (
                        <div 
                            key={i} 
                            onClick={() => actions.setSelectedOption(opt)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedOption?.serviceType === opt.serviceType ? 'border-[var(--accent)] bg-[var(--bg-hover)]' : 'border-[var(--border)] bg-[var(--bg-app)]'}`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{opt.serviceName}</p>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{opt.serviceType}</p>
                                </div>
                                <div className="text-lg font-bold" style={{ color: "var(--accent)" }}>
                                    {opt.totalNetCharge} {opt.currency}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button 
                        disabled={!selectedOption}
                        onClick={handleConfirmOption}
                        className="px-6 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50 hover:opacity-90"
                        style={{ background: "var(--accent)", color: "#fff" }}
                    >
                        {t("common.confirm", "Confirmer l'option")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
             style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
            <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {t("demandes.new_request")}
            </h3>

            <form onSubmit={handleFetchRates} className="space-y-4">
                {!isClient && (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("demandes.client")}</label>
                        <input
                            type="text" required list="clients-list" value={client}
                            onChange={(e) => actions.setClient(e.target.value)}
                            className="px-3 py-2 rounded-xl text-sm outline-none border border-[var(--border)] bg-[var(--bg-app)]"
                            style={{ color: "var(--text-primary)" }}
                        />
                        <datalist id="clients-list">
                            {LISTE_CLIENTS.map((nom, idx) => <option key={idx} value={nom} />)}
                        </datalist>
                    </div>
                )}

                <RenderAdresseFields 
                    type="origine" title={t("demandes.origin")} data={origine} lAutreData={destination}
                    setter={actions.setOrigine} isChecked={false} setIsChecked={() => {}} adressesDisponibles={adressesDisponibles}
                    client={client} onAdresseChange={actions.handleAdresseChange} sontAdressesIdentiques={() => false}
                    estAdresseRemplie={() => true} isBelgianZip={utils.isBelgianZip} t={t}
                />

                <div className="flex justify-center -my-2 relative z-10">
                    <button type="button" onClick={actions.swapAddresses} className="p-2 rounded-full border shadow-md bg-[var(--bg-surface)] border-[var(--border)] hover:bg-[var(--bg-hover)]" style={{ color: "var(--accent)" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                        </svg>
                    </button>
                </div>

                <RenderAdresseFields 
                    type="destination" title={t("demandes.destination")} data={destination} lAutreData={origine}
                    setter={actions.setDestination} isChecked={false} setIsChecked={() => {}} adressesDisponibles={adressesDisponibles}
                    client={client} onAdresseChange={actions.handleAdresseChange} sontAdressesIdentiques={() => false}
                    estAdresseRemplie={() => true} isBelgianZip={utils.isBelgianZip} t={t}
                />

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("demandes.date")}</label>
                        <input type="date" required value={date} min={demainStr} onChange={(e) => actions.setDate(e.target.value)}
                               className="px-3 py-2 rounded-xl text-sm outline-none border border-[var(--border)] bg-[var(--bg-app)]" style={{ color: "var(--text-primary)" }} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("demandes.delivery_date")}</label>
                        <input type="date" required value={livraisonDate} min={date || demainStr} onChange={(e) => actions.setLivraisonDate(e.target.value)}
                               className="px-3 py-2 rounded-xl text-sm outline-none border border-[var(--border)] bg-[var(--bg-app)]" style={{ color: "var(--text-primary)" }} />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("demandes.weight")} (kg)</label>
                    <input type="number" required min="1" value={poids} onChange={(e) => actions.setPoids(e.target.value)}
                           className="px-3 py-2 rounded-xl text-sm outline-none border border-[var(--border)] bg-[var(--bg-app)]" style={{ color: "var(--text-primary)" }} />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-xl border border-[var(--border)] bg-[var(--bg-hover)]" style={{ color: "var(--text-primary)" }}>
                        {t("common.cancel")}
                    </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium rounded-xl transition-opacity hover:opacity-95 disabled:opacity-50" style={{ background: "var(--accent)", color: "#fff" }}>
                        {loading ? "Chargement..." : t("common.create")}
                    </button>
                </div>
            </form>
        </div>
    );
}

function RenderAdresseFields({ type, title, data, lAutreData, setter, isChecked, setIsChecked, adressesDisponibles, client, onAdresseChange, sontAdressesIdentiques, estAdresseRemplie, isBelgianZip, t }: any) {
    const zipClean = data.codePostal.trim();
    const showPaysInput = zipClean.length > 0 && (!isBelgianZip(zipClean) && (zipClean.length >= 4 || /\D/.test(zipClean)));
    const adressesFiltrees = adressesDisponibles.filter((adr: any) => !sontAdressesIdentiques(adr, lAutreData));
    const existeDeja = adressesDisponibles.some((adr: any) => sontAdressesIdentiques(adr, data));
    const afficherOptionSauvegarde = client && estAdresseRemplie(data) && !existeDeja;

    return (
        <div className="space-y-2 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-app)] relative">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{title}</span>
                {adressesDisponibles.length > 0 && (
                    <select onChange={(e) => {
                        const idx = parseInt(e.target.value);
                        if (!isNaN(idx)) setter({ ...adressesFiltrees[idx] });
                    }} className="text-xs px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-surface)] outline-none max-w-[200px] cursor-pointer" style={{ color: "var(--text-primary)" }} value="">
                        <option value="" disabled hidden>📋 {t("demandes.adresse.saved_addresses")}</option>
                        {adressesFiltrees.map((adr: any, index: number) => (
                            <option key={index} value={index}>{adr.rue} {adr.numero}, {adr.codePostal}</option>
                        ))}
                    </select>
                )}
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t("demandes.adresse.street")}</label>
                    <input type="text" required value={data.rue} onChange={(e) => onAdresseChange(type, "rue", e.target.value)} className="px-2 py-1.5 rounded-lg text-sm outline-none border border-[var(--border)] bg-[var(--bg-surface)]" style={{ color: "var(--text-primary)" }} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t("demandes.adresse.number")}</label>
                    <input type="text" required value={data.numero} onChange={(e) => onAdresseChange(type, "numero", e.target.value)} className="px-2 py-1.5 rounded-lg text-sm outline-none border border-[var(--border)] bg-[var(--bg-surface)]" style={{ color: "var(--text-primary)" }} />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                    <label className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t("demandes.adresse.box")}</label>
                    <input type="text" value={data.bte} onChange={(e) => onAdresseChange(type, "bte", e.target.value)} className="px-2 py-1.5 rounded-lg text-sm outline-none border border-[var(--border)] bg-[var(--bg-surface)]" style={{ color: "var(--text-primary)" }} />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t("demandes.adresse.zip")}</label>
                    <input type="text" required value={data.codePostal} onChange={(e) => onAdresseChange(type, "codePostal", e.target.value)} className="px-2 py-1.5 rounded-lg text-sm outline-none border border-[var(--border)] bg-[var(--bg-surface)]" style={{ color: "var(--text-primary)" }} />
                </div>
            </div>
            {showPaysInput && (
                <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-[11px] font-medium text-amber-600 dark:text-amber-400">{t("demandes.adresse.foreign_country_required")}</label>
                    <select required value={data.pays === "Belgique" ? "" : data.pays} onChange={(e) => onAdresseChange(type, "pays", e.target.value)} className="px-2 py-1.5 rounded-lg text-sm outline-none border border-amber-300 dark:border-amber-700 bg-[var(--bg-surface)] cursor-pointer" style={{ color: "var(--text-primary)" }}>
                        <option value="" disabled hidden>{t("demandes.adresse.select_country")}</option>
                        {PAYS_LIMITROPHES.map((p) => (<option key={p.code} value={t(p.translationKey)}>{t(p.translationKey)}</option>))}
                        <option value="Autre">{t("countries.other")}</option>
                    </select>
                </div>
            )}
            {afficherOptionSauvegarde && (
                <div className="flex items-center gap-2 pt-1.5 px-0.5 animate-in fade-in duration-200">
                    <input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} className="w-3.5 h-3.5 rounded border-[var(--border)] accent-[var(--accent)] bg-[var(--bg-surface)] cursor-pointer" />
                </div>
            )}
        </div>
    );
}
