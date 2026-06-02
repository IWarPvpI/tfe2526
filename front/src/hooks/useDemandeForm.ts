import { useState, useEffect } from "react";
import type { Adresse, CreateDemandeRequest, FedexResponse, FedexOption, ConfirmDemandeRequest } from "../types/api.types";
import { apiService } from "../services/api.service";

export function useDemandeForm(userRole: string | undefined, initialClient: string) {
    const [client, setClient] = useState(userRole === "client" ? initialClient : "");
    const [date, setDate] = useState("");
    const [livraisonDate, setLivraisonDate] = useState("");
    const [poids, setPoids] = useState("");
    const [origine, setOrigine] = useState<Adresse>({ rue: "", numero: "", bte: "", codePostal: "", pays: "Belgique" });
    const [destination, setDestination] = useState<Adresse>({ rue: "", numero: "", bte: "", codePostal: "", pays: "Belgique" });
    const [adressesDisponibles, setAdressesDisponibles] = useState<Adresse[]>([]);
    const [step, setStep] = useState<'form' | 'results'>('form');
    const [rates, setRates] = useState<FedexResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<FedexOption | null>(null);

    const isBelgianZip = (zip: string) => /^[0-9]{4}$/.test(zip.trim());

    const handleAdresseChange = (type: "origine" | "destination", field: keyof Adresse, value: string) => {
        const updater = type === "origine" ? setOrigine : setDestination;
        updater((prev) => {
            const updated = { ...prev, [field]: value };
            if (field === "codePostal" && isBelgianZip(value)) {
                updated.pays = "Belgique";
            }
            return updated;
        });
    };

    const swapAddresses = () => {
        const temp = { ...origine };
        setOrigine(destination);
        setDestination(temp);
    };

    const fetchRates = async (demainStr: string) => {
        if (date < demainStr) {
            throw new Error("INVALID_START_DATE");
        }
        setLoading(true);
        try {
            const formData: CreateDemandeRequest = { client, origine, destination, date, livraisonDate, poids };
            const data = await apiService.fetchRates(formData);
            setRates(data);
            setStep('results');
        } finally {
            setLoading(false);
        }
    };

    const confirmOption = async () => {
        if (!selectedOption) return;
        const payload: ConfirmDemandeRequest = {
            client,
            origine,
            destination,
            date,
            livraisonDate,
            poids,
            selectedOption
        };
        await apiService.confirmDemande(payload);
    };

    const resetForm = () => {
        setStep('form');
        setRates(null);
        setSelectedOption(null);
    };

    return {
        state: { client, date, livraisonDate, poids, origine, destination, adressesDisponibles, step, rates, loading, selectedOption },
        actions: {
            setClient, setDate, setLivraisonDate, setPoids, setOrigine, setDestination, 
            setAdressesDisponibles, setStep, setRates, setSelectedOption,
            handleAdresseChange, swapAddresses, fetchRates, confirmOption, resetForm
        },
        utils: { isBelgianZip }
    };
}
