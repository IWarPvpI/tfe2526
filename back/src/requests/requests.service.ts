import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, RequestStatus } from './entities/request.entity';
import { ConfirmDemandeDto } from './dto/confirm-demande.dto';
import axios from 'axios';

@Injectable()
export class RequestsService {
  private readonly logger = new Logger(RequestsService.name);
  
  constructor(
    @InjectRepository(Request)
    private readonly requestRepo: Repository<Request>,
  ) {}

  private readonly FEDEX_CLIENT_ID = process.env.FEDEX_CLIENT_ID;
  private readonly FEDEX_CLIENT_SECRET = process.env.FEDEX_CLIENT_SECRET;
  private readonly FEDEX_ACCOUNT_NUMBER = process.env.FEDEX_ACCOUNT_NUMBER;
  private readonly FEDEX_BASE_URL = process.env.FEDEX_BASE_URL;

  private cachedToken: { token: string; expiresAt: number } | null = null;

  async create(demandeData: any) {
    try {
      this.logger.log(`--- Nouvelle Demande de Tarifs ---`);
      const token = await this.getAccessToken();
      const fedexPayload = this.mapToFedexFormat(demandeData);

      const response = await axios.post(
        `${this.FEDEX_BASE_URL}/rate/v1/rates/quotes`,
        fedexPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-locale': 'fr_BE',
          },
        }
      );

      return this.simplifyFedexResponse(response.data);
    } catch (error) {
      this.logger.error(`❌ Erreur critique FedEx : ${error.response?.data || error.message}`);
      throw error;
    }
  }

  async confirm(confirmData: ConfirmDemandeDto) {
    try {
      this.logger.log(`--- Confirmation de Demande en DB ---`);

      const newRequest = this.requestRepo.create({
        user: { email: confirmData.client } as any, // Mock utilisateur client
        shippingDetails: {
          origine: confirmData.origine,
          destination: confirmData.destination,
          date: confirmData.date,
          livraisonDate: confirmData.livraisonDate,
          poids: confirmData.poids
        },
        selectedOption: confirmData.selectedOption,
        status: RequestStatus.CONFIRMED
      });

      const savedRequest = await this.requestRepo.save(newRequest);

      return {
        message: 'Demande confirmée et enregistrée en base de données',
        confirmationId: savedRequest.id,
        details: savedRequest
      };
    } catch (error) {
      this.logger.error(`❌ Erreur lors de la confirmation : ${error.message}`);
      throw error;
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) return this.cachedToken.token;
    
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', this.FEDEX_CLIENT_ID!);
    params.append('client_secret', this.FEDEX_CLIENT_SECRET!);

    const response = await axios.post(`${this.FEDEX_BASE_URL}/oauth/token`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = response.data;
    this.cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000) - 60000,
    };
    return data.access_token;
  }

  private simplifyFedexResponse(data: any) {
    const output = data.output || {};
    const rateReplyDetails = output.rateReplyDetails || [];
    const options = rateReplyDetails.map((detail: any) => {
      const ratedDetail = detail.ratedShipmentDetails?.[0] || {};
      return {
        serviceType: detail.serviceType,
        serviceName: detail.serviceName,
        totalNetCharge: ratedDetail.totalNetCharge || 0,
        currency: ratedDetail.currency || 'USD',
      };
    });
    return { transactionId: data.transactionId || 'N/A', options, quoteDate: output.quoteDate || new Date().toISOString() };
  }

  private mapToFedexFormat(data: any) {
    return {
      accountNumber: { value: String(this.FEDEX_ACCOUNT_NUMBER) },
      requestedShipment: {
        shipper: { address: { postalCode: data.origine.codePostal, countryCode: this.mapCountryToFedexCode(data.origine.pays) } },
        recipient: { address: { postalCode: data.destination.codePostal, countryCode: this.mapCountryToFedexCode(data.destination.pays) } },
        pickupType: 'USE_SCHEDULED_PICKUP',
        rateRequestType: ['ACCOUNT'],
        requestedPackageLineItems: [{ weight: { units: 'KG', value: parseFloat(data.poids) || 0 } }],
      },
    };
  }

  private mapCountryToFedexCode(countryName: string): string {
    const mapping: Record<string, string> = { 'Belgique': 'BE', 'France': 'FR', 'Allemagne': 'DE', 'Luxembourg': 'LU', 'Pays-Bas': 'NL', 'Espagne': 'ES', 'Italie': 'IT', 'Royaume-Uni': 'GB' };
    return mapping[countryName] || 'BE';
  }
}
