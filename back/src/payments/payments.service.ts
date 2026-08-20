import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripeKey = process.env.STRIPE_PRIVATE_KEY || process.env.STRIPE_SECRET_KEY;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  async findAll() {
    return this.paymentRepo.find({
      relations: { invoice: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.paymentRepo.findOne({
      where: { id },
      relations: { invoice: true },
    });
  }

  async create(data: any) {
    return this.paymentRepo.save(data);
  }

  async update(id: string, data: any) {
    return this.paymentRepo.save({ ...data, id });
  }

  async remove(id: string) {
    await this.paymentRepo.delete(id);
    return { deleted: true };
  }

  async createCheckoutSession(invoiceId: string, customAmount?: number) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: { user: true, request: true },
    });

    const totalAmount = customAmount ?? (invoice ? invoice.amountInclVat : 100);
    const amountInCents = Math.round(totalAmount * 100);
    const invoiceLabel = invoice?.invoiceNumber ? invoice.invoiceNumber : invoiceId;

    const params = new URLSearchParams();
    params.append('payment_method_types[0]', 'card');
    params.append('mode', 'payment');
    params.append('success_url', 'http://localhost:5173/facturation?payment=success&session_id={CHECKOUT_SESSION_ID}');
    params.append('cancel_url', 'http://localhost:5173/facturation?payment=cancel');
    params.append('line_items[0][price_data][currency]', 'eur');
    params.append('line_items[0][price_data][unit_amount]', amountInCents.toString());
    params.append('line_items[0][price_data][product_data][name]', `Facture Uniship ${invoiceLabel}`);
    params.append('line_items[0][quantity]', '1');
    params.append('metadata[invoiceId]', invoice?.id ? invoice.id : invoiceId);

    const response = await axios.post('https://api.stripe.com/v1/checkout/sessions', params, {
      headers: {
        Authorization: `Bearer ${this.stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const session = response.data;

    if (invoice) {
      await this.paymentRepo.save({
        invoice: invoice,
        provider: 'STRIPE',
        providerPaymentId: session.id,
        amount: totalAmount,
        status: 'PENDING',
      });
    }

    return {
      url: session.url,
      sessionId: session.id,
    };
  }

  async verifySession(sessionId: string) {
    const response = await axios.get(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${this.stripeKey}`,
      },
    });

    const session = response.data;
    if (session.payment_status === 'paid') {
      const invoiceId = session.metadata?.invoiceId;
      if (invoiceId) {
        const invoice = await this.invoiceRepo.findOne({
          where: { id: invoiceId },
        });

        if (invoice) {
          invoice.paymentStatus = 'PAID';
          invoice.paidAt = new Date();
          await this.invoiceRepo.save(invoice);
        }

        const payment = await this.paymentRepo.findOne({
          where: { providerPaymentId: sessionId },
        });

        if (payment) {
          payment.status = 'COMPLETED';
          await this.paymentRepo.save(payment);
        }
      }
      return { status: 'PAID', session };
    }

    return { status: session.payment_status, session };
  }

  async webhook(body: any) {
    if (body.type === 'checkout.session.completed') {
      const session = body.data?.object;
      if (session?.id) {
        await this.verifySession(session.id);
      }
    }
    return { received: true };
  }
}
