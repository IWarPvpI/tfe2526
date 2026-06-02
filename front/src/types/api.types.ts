export interface Adresse {
    rue: string;
    numero: string;
    bte: string;
    codePostal: string;
    pays: string;
}

export interface CreateDemandeRequest {
    client: string;
    origine: Adresse;
    destination: Adresse;
    date: string;
    livraisonDate: string;
    poids: string;
}

export interface FedexOption {
    serviceType: string;
    serviceName: string;
    totalNetCharge: number;
    currency: string;
}

export interface FedexResponse {
    transactionId: string;
    options: FedexOption[];
    quoteDate: string;
}

export interface ConfirmDemandeRequest {
    client: string;
    origine: Adresse;
    destination: Adresse;
    date: string;
    livraisonDate: string;
    poids: string;
    selectedOption: FedexOption;
}

export interface ApiError {
    message: string;
    status?: number;
    timestamp?: string;
    path?: string;
}
