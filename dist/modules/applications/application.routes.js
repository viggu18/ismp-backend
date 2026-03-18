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
const applicationController = __importStar(require("./application.controller"));
const application_schemas_1 = require("./application.schemas");
const campaign_schemas_1 = require("../campaigns/campaign.schemas");
const applicationRouter = (0, express_1.Router)();
applicationRouter.use(auth_middleware_1.authenticate);
applicationRouter.post("/campaigns/:campaignId/applications", (0, role_middleware_1.requireRole)(client_1.Role.INFLUENCER), (0, validate_middleware_1.validate)({ params: campaign_schemas_1.campaignIdParamSchema, body: application_schemas_1.createApplicationSchema }), (0, async_handler_1.asyncHandler)(applicationController.applyToCampaign));
applicationRouter.get("/campaigns/:campaignId/applications", (0, role_middleware_1.requireRole)(client_1.Role.HIRER), (0, validate_middleware_1.validate)({ params: campaign_schemas_1.campaignIdParamSchema }), (0, async_handler_1.asyncHandler)(applicationController.listCampaignApplications));
applicationRouter.post("/applications/:applicationId/shortlist", (0, role_middleware_1.requireRole)(client_1.Role.HIRER), (0, validate_middleware_1.validate)({ params: application_schemas_1.applicationIdParamSchema }), (0, async_handler_1.asyncHandler)(applicationController.shortlistApplication));
applicationRouter.post("/applications/:applicationId/reject", (0, role_middleware_1.requireRole)(client_1.Role.HIRER), (0, validate_middleware_1.validate)({ params: application_schemas_1.applicationIdParamSchema }), (0, async_handler_1.asyncHandler)(applicationController.rejectApplication));
exports.default = applicationRouter;
