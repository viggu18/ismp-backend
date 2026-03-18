"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureContentActionAllowed = exports.ensurePaymentTransition = exports.ensureOfferTransition = void 0;
const client_1 = require("@prisma/client");
const app_error_1 = require("../errors/app-error");
const ensureOfferTransition = (currentStatus, nextStatus) => {
    const allowedTransitions = {
        PENDING: [client_1.OfferStatus.ACCEPTED, client_1.OfferStatus.DECLINED, client_1.OfferStatus.COUNTERED, client_1.OfferStatus.EXPIRED],
        COUNTERED: [client_1.OfferStatus.PENDING, client_1.OfferStatus.ACCEPTED, client_1.OfferStatus.DECLINED, client_1.OfferStatus.EXPIRED],
        ACCEPTED: [],
        DECLINED: [],
        EXPIRED: [],
    };
    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
        throw new app_error_1.AppError(`Cannot transition offer from ${currentStatus} to ${nextStatus}`, 409);
    }
};
exports.ensureOfferTransition = ensureOfferTransition;
const ensurePaymentTransition = (currentStatus, nextStatus) => {
    const allowedTransitions = {
        PENDING: [client_1.PaymentStatus.IN_ESCROW, client_1.PaymentStatus.REFUNDED],
        IN_ESCROW: [client_1.PaymentStatus.RELEASED, client_1.PaymentStatus.REFUNDED],
        RELEASED: [],
        REFUNDED: [],
        EXTERNAL: [client_1.PaymentStatus.RELEASED, client_1.PaymentStatus.REFUNDED],
    };
    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
        throw new app_error_1.AppError(`Cannot transition payment from ${currentStatus} to ${nextStatus}`, 409);
    }
};
exports.ensurePaymentTransition = ensurePaymentTransition;
const ensureContentActionAllowed = (currentStatus, action) => {
    const allowedActions = {
        SUBMITTED: ["request-revision", "approve"],
        REVISION_REQUESTED: [],
        APPROVED: [],
    };
    if (!allowedActions[currentStatus].includes(action)) {
        throw new app_error_1.AppError(`Cannot ${action} when content submission is ${currentStatus}`, 409);
    }
};
exports.ensureContentActionAllowed = ensureContentActionAllowed;
