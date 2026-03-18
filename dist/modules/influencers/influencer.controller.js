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
exports.getEarningsHistory = exports.replaceRateCards = exports.replaceSocialAccounts = exports.upsertMyProfile = exports.getMyProfile = void 0;
const pagination_1 = require("../../common/utils/pagination");
const response_1 = require("../../common/utils/response");
const influencerService = __importStar(require("./influencer.service"));
const getMyProfile = async (req, res) => {
    const profile = await influencerService.getMyProfile(req.currentUser.userId);
    return (0, response_1.sendSuccess)(res, profile, "Influencer profile fetched");
};
exports.getMyProfile = getMyProfile;
const upsertMyProfile = async (req, res) => {
    const profile = await influencerService.upsertMyProfile(req.currentUser.userId, req.body);
    return (0, response_1.sendSuccess)(res, profile, "Influencer profile saved");
};
exports.upsertMyProfile = upsertMyProfile;
const replaceSocialAccounts = async (req, res) => {
    const socialAccounts = await influencerService.replaceSocialAccounts(req.currentUser.userId, req.body);
    return (0, response_1.sendSuccess)(res, socialAccounts, "Social accounts saved");
};
exports.replaceSocialAccounts = replaceSocialAccounts;
const replaceRateCards = async (req, res) => {
    const rateCards = await influencerService.replaceRateCards(req.currentUser.userId, req.body);
    return (0, response_1.sendSuccess)(res, rateCards, "Rate cards saved");
};
exports.replaceRateCards = replaceRateCards;
const getEarningsHistory = async (req, res) => {
    const history = await influencerService.getEarningsHistory(req.currentUser.userId, (0, pagination_1.getPagination)(req));
    return (0, response_1.sendSuccess)(res, history, "Earnings history fetched");
};
exports.getEarningsHistory = getEarningsHistory;
