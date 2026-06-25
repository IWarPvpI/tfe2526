import type {
    CreateDemandeRequest,
    FedexResponse,
    ConfirmDemandeRequest,
    ApiError
} from '../types/api.types';

const API_BASE_URL = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorData: ApiError;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: `Erreur ${response.status}: ${response.statusText}` };
        }
        throw errorData;
    }
    return response.json();
}

export const apiService = {
    async fetchRates(formData: CreateDemandeRequest): Promise<FedexResponse> {
        const response = await fetch(`${API_BASE_URL}/requests/quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        return handleResponse<FedexResponse>(response);
    },

    async confirmDemande(payload: ConfirmDemandeRequest): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/requests/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return handleResponse<any>(response);
    },

    async validateAddress(addressData: { street?: string; number?: string; codePostal: string; pays: string }): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/requests/validate-address`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                street: addressData.street,
                number: addressData.number,
                postalCode: addressData.codePostal,
                country: addressData.pays,
            }),
        });
        return handleResponse<any>(response);
    },
};
