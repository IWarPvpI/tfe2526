import type {
    CreateDemandeRequest,
    FedexResponse,
    ConfirmDemandeRequest,
    ApiError
} from '../types/api.types';

const API_BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorData: ApiError;
        try {
            errorData = await response.json();
        } catch {
            errorData = { message: `Erreur ${response.status}: ${response.statusText}` };
        }
        throw errorData;
    }
    return response.json();
}

export const apiService = {
    async authLogin(credentials: { email: string; password?: string }): Promise<{ accessToken: string; user: any }> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        return handleResponse<{ accessToken: string; user: any }>(response);
    },

    async getMe(): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: getAuthHeaders(),
        });
        return handleResponse<any>(response);
    },

    async changePassword(passwords: { currentPassword: string; newPassword: string }): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(passwords),
        });
        return handleResponse<any>(response);
    },

    async fetchRates(formData: CreateDemandeRequest): Promise<FedexResponse> {
        const response = await fetch(`${API_BASE_URL}/requests/quote`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(formData),
        });
        return handleResponse<FedexResponse>(response);
    },

    async confirmDemande(payload: ConfirmDemandeRequest): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/requests/confirm`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return handleResponse<any>(response);
    },

    async validateAddress(addressData: { street?: string; number?: string; codePostal: string; pays: string }): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/requests/validate-address`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                street: addressData.street,
                number: addressData.number,
                postalCode: addressData.codePostal,
                country: addressData.pays,
            }),
        });
        return handleResponse<any>(response);
    },

    async getEnterprises(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/enterprises`, {
            headers: getAuthHeaders(),
        });
        return handleResponse<any[]>(response);
    },

    async getEnterprise(id: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/enterprises/${id}`, {
            headers: getAuthHeaders(),
        });
        return handleResponse<any>(response);
    },

    async createEnterprise(enterpriseData: { name: string; email?: string; phone?: string; type?: string; city?: string; country?: string; vatNumber?: string }): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/enterprises`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(enterpriseData),
        });
        return handleResponse<any>(response);
    },

    async getUsers(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: getAuthHeaders(),
        });
        return handleResponse<any[]>(response);
    },

    async createUser(userData: { firstName: string; lastName: string; email: string; phone?: string; password?: string; passwordHash?: string; role?: string }): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData),
        });
        return handleResponse<any>(response);
    },

    async getExpeditions(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/requests`, {
            headers: getAuthHeaders(),
        });
        return handleResponse<any[]>(response);
    },

    async trackShipment(trackingNumber: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/requests/track/${trackingNumber}`, {
            headers: getAuthHeaders(),
        });
        return handleResponse<any>(response);
    },

    async getInvoices(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/invoices`, {
            headers: getAuthHeaders(),
        });
        return handleResponse<any[]>(response);
    },

    async createStripeCheckoutSession(invoiceId: string, amount?: number): Promise<{ url: string; sessionId: string }> {
        const response = await fetch(`${API_BASE_URL}/payments/create-checkout-session`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ invoiceId, amount }),
        });
        return handleResponse<{ url: string; sessionId: string }>(response);
    },

    async verifyStripePayment(sessionId: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/payments/verify/${sessionId}`, {
            headers: getAuthHeaders(),
        });
        return handleResponse<any>(response);
    },
};
