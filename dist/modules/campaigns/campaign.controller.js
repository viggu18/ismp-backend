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
exports.closeCampaign = exports.openCampaign = exports.updateCampaign = exports.getCampaignById = exports.browseCampaigns = exports.listMyCampaigns = exports.createCampaign = void 0;
const client_1 = require("@prisma/client");
const pagination_1 = require("../../common/utils/pagination");
const response_1 = require("../../common/utils/response");
const campaignService = __importStar(require("./campaign.service"));
const createCampaign = async (req, res) => {
    const campaign = await campaignService.createCampaign(req.currentUser.userId, req.body);
    return (0, response_1.sendSuccess)(res, campaign, "Campaign created", 201);
};
exports.createCampaign = createCampaign;
const listMyCampaigns = async (req, res) => {
    const campaigns = await campaignService.listMyCampaigns(req.currentUser.userId, (0, pagination_1.getPagination)(req));
    return (0, response_1.sendSuccess)(res, campaigns, "Campaigns fetched");
};
exports.listMyCampaigns = listMyCampaigns;
const browseCampaigns = async (req, res) => {
    const campaigns = await campaignService.browseCampaigns(req.currentUser.userId, req.currentUser.role, req.query, (0, pagination_1.getPagination)(req));
    return (0, response_1.sendSuccess)(res, campaigns, "Campaigns fetched");
};
exports.browseCampaigns = browseCampaigns;
const getCampaignById = async (req, res) => {
    const { campaignId } = req.params;
    const campaign = await campaignService.getCampaignById(campaignId, req.currentUser.userId, req.currentUser.role);
    return (0, response_1.sendSuccess)(res, campaign, "Campaign fetched");
};
exports.getCampaignById = getCampaignById;
const updateCampaign = async (req, res) => {
    const { campaignId } = req.params;
    const campaign = await campaignService.updateCampaign(campaignId, req.currentUser.userId, req.body);
    return (0, response_1.sendSuccess)(res, campaign, "Campaign updated");
};
exports.updateCampaign = updateCampaign;
const openCampaign = async (req, res) => {
    const { campaignId } = req.params;
    const campaign = await campaignService.changeCampaignStatus(campaignId, req.currentUser.userId, client_1.CampaignStatus.OPEN);
    return (0, response_1.sendSuccess)(res, campaign, "Campaign opened");
};
exports.openCampaign = openCampaign;
const closeCampaign = async (req, res) => {
    const { campaignId } = req.params;
    const campaign = await campaignService.changeCampaignStatus(campaignId, req.currentUser.userId, client_1.CampaignStatus.CLOSED);
    return (0, response_1.sendSuccess)(res, campaign, "Campaign closed");
};
exports.closeCampaign = closeCampaign;
