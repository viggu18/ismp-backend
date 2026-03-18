"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundEscrow = exports.releaseEscrow = exports.lockEscrow = exports.getPayment = void 0;
const response_1 = require("../../common/utils/response");
const paymentService = __importStar(require("./payment.service"));
const getPayment = async (req, res) => {
    const { offerId } = req.params;
    const payment = await paymentService.getPayment(req.currentUser.userId, offerId);
    return (0, response_1.sendSuccess)(res, payment, "Payment fetched");
};
exports.getPayment = getPayment;
const lockEscrow = async (req, res) => {
    const { offerId } = req.params;
    const payment = await paymentService.lockEscrow(req.currentUser.userId, offerId);
    return (0, response_1.sendSuccess)(res, payment, "Payment moved to escrow");
};
exports.lockEscrow = lockEscrow;
const releaseEscrow = async (req, res) => {
    const { offerId } = req.params;
    const payment = await paymentService.releaseEscrow(req.currentUser.userId, offerId);
    return (0, response_1.sendSuccess)(res, payment, "Payment released");
};
exports.releaseEscrow = releaseEscrow;
const refundEscrow = async (req, res) => {
    const { offerId } = req.params;
    const payment = await paymentService.refundEscrow(req.currentUser.userId, offerId);
    return (0, response_1.sendSuccess)(res, payment, "Payment refunded");
};
exports.refundEscrow = refundEscrow;
