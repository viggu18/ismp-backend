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
const offer_schemas_1 = require("../offers/offer.schemas");
const contentSubmissionController = __importStar(require("./content-submission.controller"));
const content_submission_schemas_1 = require("./content-submission.schemas");
const contentSubmissionRouter = (0, express_1.Router)();
contentSubmissionRouter.use(auth_middleware_1.authenticate);
contentSubmissionRouter.get("/offers/:offerId/content-submissions", (0, validate_middleware_1.validate)({ params: offer_schemas_1.offerIdParamSchema }), (0, async_handler_1.asyncHandler)(contentSubmissionController.listSubmissions));
contentSubmissionRouter.post("/offers/:offerId/content-submissions", (0, role_middleware_1.requireRole)(client_1.Role.INFLUENCER), (0, validate_middleware_1.validate)({ params: offer_schemas_1.offerIdParamSchema, body: content_submission_schemas_1.submitContentSchema }), (0, async_handler_1.asyncHandler)(contentSubmissionController.submitContent));
contentSubmissionRouter.post("/content-submissions/:submissionId/request-revision", (0, role_middleware_1.requireRole)(client_1.Role.HIRER), (0, validate_middleware_1.validate)({ params: content_submission_schemas_1.submissionIdParamSchema, body: content_submission_schemas_1.requestRevisionSchema }), (0, async_handler_1.asyncHandler)(contentSubmissionController.requestRevision));
contentSubmissionRouter.post("/content-submissions/:submissionId/approve", (0, role_middleware_1.requireRole)(client_1.Role.HIRER), (0, validate_middleware_1.validate)({ params: content_submission_schemas_1.submissionIdParamSchema }), (0, async_handler_1.asyncHandler)(contentSubmissionController.approveSubmission));
contentSubmissionRouter.post("/content-submissions/:submissionId/publish", (0, role_middleware_1.requireRole)(client_1.Role.INFLUENCER), (0, validate_middleware_1.validate)({ params: content_submission_schemas_1.submissionIdParamSchema, body: content_submission_schemas_1.publishConfirmationSchema }), (0, async_handler_1.asyncHandler)(contentSubmissionController.confirmPublish));
exports.default = contentSubmissionRouter;
