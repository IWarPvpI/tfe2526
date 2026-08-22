import { Injectable, Logger, UseGuards} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, RequestStatus } from './entities/request.entity';
import { ConfirmDemandeDto } from './dto/confirm-demande.dto';
import axios from 'axios';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
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
  private readonly FEDEX_TRACK_CLIENT_ID = process.env.FEDEX_TRACK_CLIENT_ID;
  private readonly FEDEX_TRACK_CLIENT_SECRET = process.env.FEDEX_TRACK_CLIENT_SECRET;

  private cachedToken: { token: string; expiresAt: number } | null = null;

  async create(demandeData: any) {
    try {
      this.logger.log(`--- Nouvelle Demande de Tarifs ---`);
      this.logger.log(demandeData)
      const token = await this.getAccessToken();
      const fedexPayload = this.mapToFedexFormat(demandeData);

      const response = await axios.post(
        `${this.FEDEX_BASE_URL}/rate/v1/rates/quotes`,
        fedexPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-locale': 'fr_BE',
          },
        },
      );
      this.logger.log(`--- Nouvelle Demande de response ---`);
      this.logger.log(response)
      return this.simplifyFedexResponse(response.data);
    } catch (error) {
      this.logger.error(
        `❌ Erreur critique FedEx : ${error.response?.data || error.message}`,
      );
      throw error;
    }
  }

  async validateAddress(addressData: {
    street?: string;
    number?: string;
    postalCode: string;
    country: string;
  }) {
    try {
      this.logger.log(`--- Validation d'Adresse auprès de FedEx ---`);
      const countryCode = this.mapCountryToFedexCode(addressData.country);
      const streetLine = [addressData.street, addressData.number]
        .filter(Boolean)
        .join(' ')
        .trim();
      const zipClean = (addressData.postalCode || '').trim();

      if (countryCode === 'BE' && !/^[0-9]{4}$/.test(zipClean)) {
        return {
          isValid: false,
          message: 'Le code postal belge doit contenir 4 chiffres',
        };
      }

      if (countryCode === 'FR' && !/^[0-9]{5}$/.test(zipClean)) {
        return {
          isValid: false,
          message: 'Le code postal français doit contenir 5 chiffres',
        };
      }

      try {
        const token = await this.getAccessToken();
        const fedexPayload = {
          addressesToValidate: [
            {
              address: {
                streetLines: streetLine ? [streetLine] : [],
                postalCode: zipClean,
                countryCode: countryCode,
              },
            },
          ],
        };

        const response = await axios.post(
          `${this.FEDEX_BASE_URL}/address/v1/addresses/resolve`,
          fedexPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              'x-locale': 'fr_BE',
            },
          },
        );

        const resolved = response.data?.output?.resolvedAddresses?.[0];
        const isResolved =
          resolved?.attributes?.Resolved === 'true' ||
          resolved?.attributes?.Resolved === true;

        if (resolved && isResolved && resolved.city) {
          return {
            isValid: true,
            street: resolved.streetLinesToken?.[0] || streetLine,
            city: resolved.city || '',
            postalCode: resolved.postalCode || zipClean,
            countryCode: resolved.countryCode || countryCode,
          };
        }
      } catch (fedexErr) {
        this.logger.warn(
          `API FedEx Sandbox Resolve warning: ${fedexErr.message}`,
        );
      }

      return {
        isValid: true,
        street: streetLine,
        postalCode: zipClean,
        countryCode: countryCode,
        message: 'Adresse validée au niveau format local',
      };
    } catch (error) {
      this.logger.error(`❌ Erreur validation adresse : ${error.message}`);
      return {
        isValid: false,
        message: "Impossible de valider l'adresse",
      };
    }
  }

  async confirm(confirmData: ConfirmDemandeDto) {
    try {
      this.logger.log(`--- Confirmation de Demande en DB & FedEx Ship API ---`);

      const newRequest = this.requestRepo.create({
        user: { email: confirmData.client } as any,
        shippingDetails: {
          origine: confirmData.origine,
          destination: confirmData.destination,
          date: confirmData.date,
          livraisonDate: confirmData.livraisonDate,
          poids: confirmData.poids,
        },
        selectedOption: confirmData.selectedOption,
        status: RequestStatus.CONFIRMED,
      });

      try {
        const token = await this.getAccessToken();
        const fedexPayload = {
          labelResponseOptions: 'URL_ONLY',
          requestedShipment: {
            shipper: {
              contact: {
                personName: confirmData.client || 'Client Uniship',
              },
              address: {
                streetLines: [
                  `${confirmData.origine.rue} ${confirmData.origine.numero}`.trim(),
                ],
                city: confirmData.origine.ville,
                postalCode: confirmData.origine.codePostal,
                countryCode: this.mapCountryToFedexCode(
                  confirmData.origine.pays,
                ),
              },
            },
            recipients: [
              {
                contact: {
                  personName: 'Destinataire',
                },
                address: {
                  streetLines: [
                    `${confirmData.destination.rue} ${confirmData.destination.numero}`.trim(),
                  ],
                  city: confirmData.destination.ville,
                  postalCode: confirmData.destination.codePostal,
                  countryCode: this.mapCountryToFedexCode(
                    confirmData.destination.pays,
                  ),
                },
              },
            ],
            serviceType: confirmData.selectedOption,
            packagingType: 'YOUR_PACKAGING',
            pickupType: 'USE_SCHEDULED_PICKUP',
            labelSpecification: {
              imageType: 'PDF',
              labelStockType: 'PAPER_8.5X11_TOP_OPTION_ONLY',
            },
            requestedPackageLineItems: [
              {
                weight: { units: 'KG', value: confirmData.poids },
              },
            ],
          },
          accountNumber: this.FEDEX_ACCOUNT_NUMBER,
        };

        const response = await axios.post(
          `${this.FEDEX_BASE_URL}/ship/v1/shipments`,
          fedexPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              'x-locale': 'fr_BE',
            },
          },
        );

        const shipment = response.data?.output?.transactionShipments?.[0];
        newRequest.fedexTrackingNumber = shipment.masterTrackingNumber;
        newRequest.labelUrl = shipment.shipmentDocuments?.[0]?.url;
      } catch (fedexErr) {
        this.logger.warn(
          ` ❌ Erreur lors de la confirmation fedex: ${fedexErr.message}`,
        );
      }

      const savedRequest = await this.requestRepo.save(newRequest);

      return {
        message: 'Demande confirmée et enregistrée en base de données',
        confirmationId: savedRequest.id,
        details: savedRequest,
      };
    } catch (error) {
      this.logger.error(`❌ Erreur lors de la confirmation : ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    return this.requestRepo.find({
      order: { createdAt: 'DESC' },
      relations: {
        user: true,
        createdBy: true,
      },
    });
  }

  async findByUser(userId: string) {
    return this.requestRepo.find({
      where: [
        { user: { id: userId } },
        { createdBy: { id: userId } },
      ],
      order: { createdAt: 'DESC' },
      relations: {
        user: true,
        createdBy: true,
      },
    });
  }

  async findOne(id: string) {
    return this.requestRepo.findOne({
      where: { id },
      relations: {
        user: true,
        createdBy: true,
      },
    });
  }

  private cachedTrackToken: { token: string; expiresAt: number } | null = null;

  async trackShipment(trackingNumber: string) {
    if (
      !trackingNumber ||
      trackingNumber === 'null' ||
      trackingNumber === 'undefined'
    ) {
      return {
        trackingNumber: null,
        status: null,
        statusCode: null,
        estimatedDelivery: null,
        actualDelivery: null,
        scanEvents: [],
      };
    }

    try {
      this.logger.log(
        `🔍 [FedEx Track] Interrogation du statut pour : ${trackingNumber}`,
      );
      const token = await this.getTrackAccessToken();
      const baseUrl = this.FEDEX_BASE_URL;
      const response = await axios.post(
        `${baseUrl}/track/v1/trackingnumbers`,
        {
          includeDetailedScans: true,
          trackingInfo: [
            {
              trackingNumberInfo: {
                trackingNumber: trackingNumber,
              },
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-locale': 'fr_BE',
          },
        },
      );

      const trackResult =
        response.data?.output?.completeTrackResults?.[0]?.trackResults?.[0];
      return {
        trackingNumber: trackingNumber,
        status:
          trackResult?.latestStatusDetail?.statusByLocale ??
          trackResult?.latestStatusDetail?.description ??
          null,
        statusCode: trackResult?.latestStatusDetail?.code ?? null,
        estimatedDelivery:
          trackResult?.dateAndTimes?.find(
            (d: any) => d.type === 'ESTIMATED_DELIVERY',
          )?.dateTime ?? null,
        actualDelivery:
          trackResult?.dateAndTimes?.find(
            (d: any) => d.type === 'ACTUAL_DELIVERY',
          )?.dateTime ?? null,
        scanEvents: trackResult?.scanEvents ?? [],
      };
    } catch (error) {
      this.logger.error(
        `❌ Erreur FedEx Track API (${trackingNumber}): ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`,
      );
      throw error;
    }
  }

  private async getTrackAccessToken(): Promise<string> {
    if (this.cachedTrackToken && Date.now() < this.cachedTrackToken.expiresAt)
      return this.cachedTrackToken.token;

    //TODO
    const clientId = this.FEDEX_TRACK_CLIENT_ID;
    const clientSecret = this.FEDEX_TRACK_CLIENT_SECRET;
    const baseUrl = this.FEDEX_BASE_URL;

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId!);
    params.append('client_secret', clientSecret!);

    const response = await axios.post(`${baseUrl}/oauth/token`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = response.data;
    this.cachedTrackToken = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000 - 60000,
    };
    return data.access_token;
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt)
      return this.cachedToken.token;

    const baseUrl = this.FEDEX_BASE_URL;
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', this.FEDEX_CLIENT_ID!);
    params.append('client_secret', this.FEDEX_CLIENT_SECRET!);

    const response = await axios.post(`${baseUrl}oauth/token`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = response.data;
    this.cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000 - 60000,
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
        totalNetCharge: ratedDetail.totalNetCharge,
        currency: ratedDetail.currency,
      };
    });
    return {
      transactionId: data.transactionId,
      options,
      quoteDate: output.quoteDate || new Date().toISOString(),
    };
  }

  private mapToFedexFormat(data: any) {
    return {
      accountNumber: { value: String(this.FEDEX_ACCOUNT_NUMBER) },
      requestedShipment: {
        shipper: {
          address: {
            postalCode: data.origine.codePostal,
            countryCode: this.mapCountryToFedexCode(data.origine.pays),
          },
        },
        recipient: {
          address: {
            postalCode: data.destination.codePostal,
            countryCode: this.mapCountryToFedexCode(data.destination.pays),
          },
        },
        pickupType: 'USE_SCHEDULED_PICKUP',
        rateRequestType: ['ACCOUNT'],
        requestedPackageLineItems: [
          { weight: { units: 'KG', value: parseFloat(data.poids) || 0 } },
        ],
      },
    };
  }

  private mapCountryToFedexCode(countryName: string): string {
    if (!countryName) return 'BE';
    const trimmed = countryName.trim();
    if (trimmed.length === 2) return trimmed.toUpperCase();

    const mapping: Record<string, string> = {
      Belgique: 'BE',
      France: 'FR',
      Allemagne: 'DE',
      Luxembourg: 'LU',
      'Pays-Bas': 'NL',
      Espagne: 'ES',
      Italie: 'IT',
      'Royaume-Uni': 'GB',
      'États-Unis': 'US',
      Canada: 'CA',
      Suisse: 'CH',
      Chine: 'CN',
      Japon: 'JP',
      Australie: 'AU',
      Brésil: 'BR',
      Mexique: 'MX',
      Inde: 'IN',
      'Émirats Arabes Unis': 'AE',
      Maroc: 'MA',
      Algérie: 'DZ',
      Tunisie: 'TN',
      Portugal: 'PT',
      Pologne: 'PL',
      Autriche: 'AT',
      Suède: 'SE',
      Norvège: 'NO',
      Danemark: 'DK',
      Finlande: 'FI',
      Irlande: 'IE',
      Grèce: 'GR',
      Turquie: 'TR',
    };
    return mapping[trimmed] || 'BE';
  }
}
