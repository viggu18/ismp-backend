import { PaymentStatus } from "@prisma/client";

export type PaymentProviderResult = {
  status: PaymentStatus;
  reference: string;
};

export interface PaymentProvider {
  createEscrow(offerId: string): Promise<PaymentProviderResult>;
  releaseEscrow(offerId: string): Promise<PaymentProviderResult>;
  refundEscrow(offerId: string): Promise<PaymentProviderResult>;
}

class PlaceholderPaymentProvider implements PaymentProvider {
  async createEscrow(offerId: string): Promise<PaymentProviderResult> {
    return {
      status: PaymentStatus.IN_ESCROW,
      reference: `escrow:${offerId}:${Date.now()}`,
    };
  }

  async releaseEscrow(offerId: string): Promise<PaymentProviderResult> {
    return {
      status: PaymentStatus.RELEASED,
      reference: `release:${offerId}:${Date.now()}`,
    };
  }

  async refundEscrow(offerId: string): Promise<PaymentProviderResult> {
    return {
      status: PaymentStatus.REFUNDED,
      reference: `refund:${offerId}:${Date.now()}`,
    };
  }
}

export const paymentProvider = new PlaceholderPaymentProvider();
