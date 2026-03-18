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
exports.expireOffer = exports.reviseOffer = exports.counterOffer = exports.declineOffer = exports.acceptOffer = exports.getOfferById = exports.listMyOffers = exports.createOffer = void 0;
const response_1 = require("../../common/utils/response");
const offerService = __importStar(require("./offer.service"));
const createOffer = async (req, res) => {
    const offer = await offerService.createOffer(req.currentUser.userId, req.body);
    return (0, response_1.sendSuccess)(res, offer, "Offer created", 201);
};
exports.createOffer = createOffer;
const listMyOffers = async (req, res) => {
    const offers = await offerService.listMyOffers(req.currentUser.userId, req.currentUser.role);
    return (0, response_1.sendSuccess)(res, offers, "Offers fetched");
};
exports.listMyOffers = listMyOffers;
const getOfferById = async (req, res) => {
    const { offerId } = req.params;
    const offer = await offerService.getOfferById(req.currentUser.userId, req.currentUser.role, offerId);
    return (0, response_1.sendSuccess)(res, offer, "Offer fetched");
};
exports.getOfferById = getOfferById;
const acceptOffer = async (req, res) => {
    const { offerId } = req.params;
    const offer = await offerService.acceptOffer(req.currentUser.userId, offerId);
    return (0, response_1.sendSuccess)(res, offer, "Offer accepted");
};
exports.acceptOffer = acceptOffer;
const declineOffer = async (req, res) => {
    const { offerId } = req.params;
    const offer = await offerService.declineOffer(req.currentUser.userId, offerId);
    return (0, response_1.sendSuccess)(res, offer, "Offer declined");
};
exports.declineOffer = declineOffer;
const counterOffer = async (req, res) => {
    const { offerId } = req.params;
    const offer = await offerService.counterOffer(req.currentUser.userId, offerId, req.body);
    return (0, response_1.sendSuccess)(res, offer, "Offer countered");
};
exports.counterOffer = counterOffer;
const reviseOffer = async (req, res) => {
    const { offerId } = req.params;
    const offer = await offerService.reviseOffer(req.currentUser.userId, offerId, req.body);
    return (0, response_1.sendSuccess)(res, offer, "Offer revised");
};
exports.reviseOffer = reviseOffer;
const expireOffer = async (req, res) => {
    const { offerId } = req.params;
    const offer = await offerService.expireOffer(req.currentUser.userId, offerId);
    return (0, response_1.sendSuccess)(res, offer, "Offer expired");
};
exports.expireOffer = expireOffer;
