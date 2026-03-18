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
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../../common/middleware/auth.middleware");
const async_handler_1 = require("../../common/middleware/async-handler");
const role_middleware_1 = require("../../common/middleware/role.middleware");
const validate_middleware_1 = require("../../common/middleware/validate.middleware");
const offerController = __importStar(require("./offer.controller"));
const offer_schemas_1 = require("./offer.schemas");
const offerRouter = (0, express_1.Router)();
offerRouter.use(auth_middleware_1.authenticate);
offerRouter.get("/my", (0, async_handler_1.asyncHandler)(offerController.listMyOffers));
offerRouter.get("/:offerId", (0, validate_middleware_1.validate)({ params: offer_schemas_1.offerIdParamSchema }), (0, async_handler_1.asyncHandler)(offerController.getOfferById));
offerRouter.post("/", (0, role_middleware_1.requireRole)(client_1.Role.HIRER), (0, validate_middleware_1.validate)({ body: offer_schemas_1.createOfferSchema }), (0, async_handler_1.asyncHandler)(offerController.createOffer));
offerRouter.post("/:offerId/accept", (0, role_middleware_1.requireRole)(client_1.Role.INFLUENCER), (0, validate_middleware_1.validate)({ params: offer_schemas_1.offerIdParamSchema }), (0, async_handler_1.asyncHandler)(offerController.acceptOffer));
offerRouter.post("/:offerId/decline", (0, role_middleware_1.requireRole)(client_1.Role.INFLUENCER), (0, validate_middleware_1.validate)({ params: offer_schemas_1.offerIdParamSchema }), (0, async_handler_1.asyncHandler)(offerController.declineOffer));
offerRouter.post("/:offerId/counter", (0, role_middleware_1.requireRole)(client_1.Role.INFLUENCER), (0, validate_middleware_1.validate)({ params: offer_schemas_1.offerIdParamSchema, body: offer_schemas_1.counterOfferSchema }), (0, async_handler_1.asyncHandler)(offerController.counterOffer));
offerRouter.post("/:offerId/revise", (0, role_middleware_1.requireRole)(client_1.Role.HIRER), (0, validate_middleware_1.validate)({ params: offer_schemas_1.offerIdParamSchema, body: offer_schemas_1.reviseOfferSchema }), (0, async_handler_1.asyncHandler)(offerController.reviseOffer));
offerRouter.post("/:offerId/expire", (0, role_middleware_1.requireRole)(client_1.Role.HIRER), (0, validate_middleware_1.validate)({ params: offer_schemas_1.offerIdParamSchema }), (0, async_handler_1.asyncHandler)(offerController.expireOffer));
exports.default = offerRouter;
