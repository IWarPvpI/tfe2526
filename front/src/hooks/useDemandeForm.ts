import { useState } from "react";
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
    const [origineError, setOrigineError] = useState<string | null>(null);
    const [destinationError, setDestinationError] = useState<string | null>(null);

    const isBelgianZip = (zip: string) => /^[0-9]{4}$/.test(zip.trim());

    const handleAdresseChange = (type: "origine" | "destination", field: keyof Adresse, value: string) => {
        if (type === "origine") setOrigineError(null);
        if (type === "destination") setDestinationError(null);

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
        setOrigineError(null);
        setDestinationError(null);
    };

    const fetchRates = async (demainStr: string) => {
        if (date < demainStr) {
            throw new Error("INVALID_START_DATE");
        }
        setLoading(true);
        setOrigineError(null);
        setDestinationError(null);
        try {
            const valOrigine = await apiService.validateAddress({
                street: origine.rue,
                number: origine.numero,
                codePostal: origine.codePostal,
                pays: origine.pays,
            });
            if (valOrigine && !valOrigine.isValid) {
                setOrigineError("L'adresse d'ORIGINE est invalide ou non reconnue par FedEx. Veuillez vérifier la rue, le numéro ou le code postal.");
                throw new Error("INVALID_ORIGIN_ADDRESS");
            }

            const valDestination = await apiService.validateAddress({
                street: destination.rue,
                number: destination.numero,
                codePostal: destination.codePostal,
                pays: destination.pays,
            });
            if (valDestination && !valDestination.isValid) {
                setDestinationError("L'adresse de DESTINATION est invalide ou non reconnue par FedEx. Veuillez vérifier la rue, le numéro ou le code postal.");
                throw new Error("INVALID_DESTINATION_ADDRESS");
            }

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
        setOrigineError(null);
        setDestinationError(null);
    };

    return {
        state: { client, date, livraisonDate, poids, origine, destination, adressesDisponibles, step, rates, loading, selectedOption, origineError, destinationError },
        actions: {
            setClient, setDate, setLivraisonDate, setPoids, setOrigine, setDestination, 
            setAdressesDisponibles, setStep, setRates, setSelectedOption,
            handleAdresseChange, swapAddresses, fetchRates, confirmOption, resetForm
        },
        utils: { isBelgianZip }
    };
}
