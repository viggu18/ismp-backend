"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentProvider = void 0;
const client_1 = require("@prisma/client");
class PlaceholderPaymentProvider {
    async createEscrow(offerId) {
        return {
            status: client_1.PaymentStatus.IN_ESCROW,
            reference: `escrow:${offerId}:${Date.now()}`,
        };
    }
    async releaseEscrow(offerId) {
        return {
            status: client_1.PaymentStatus.RELEASED,
            reference: `release:${offerId}:${Date.now()}`,
        };
    }
    async refundEscrow(offerId) {
        return {
            status: client_1.PaymentStatus.REFUNDED,
            reference: `refund:${offerId}:${Date.now()}`,
        };
    }
}
exports.paymentProvider = new PlaceholderPaymentProvider();
