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
exports.confirmPublish = exports.approveSubmission = exports.requestRevision = exports.submitContent = exports.listSubmissions = void 0;
const response_1 = require("../../common/utils/response");
const contentSubmissionService = __importStar(require("./content-submission.service"));
const listSubmissions = async (req, res) => {
    const { offerId } = req.params;
    const submissions = await contentSubmissionService.listSubmissions(req.currentUser.userId, offerId);
    return (0, response_1.sendSuccess)(res, submissions, "Content submissions fetched");
};
exports.listSubmissions = listSubmissions;
const submitContent = async (req, res) => {
    const { offerId } = req.params;
    const submission = await contentSubmissionService.submitContent(req.currentUser.userId, offerId, req.body);
    return (0, response_1.sendSuccess)(res, submission, "Content submitted", 201);
};
exports.submitContent = submitContent;
const requestRevision = async (req, res) => {
    const { submissionId } = req.params;
    const submission = await contentSubmissionService.requestRevision(req.currentUser.userId, submissionId, req.body.revisionNote);
    return (0, response_1.sendSuccess)(res, submission, "Revision requested");
};
exports.requestRevision = requestRevision;
const approveSubmission = async (req, res) => {
    const { submissionId } = req.params;
    const submission = await contentSubmissionService.approveSubmission(req.currentUser.userId, submissionId);
    return (0, response_1.sendSuccess)(res, submission, "Content approved");
};
exports.approveSubmission = approveSubmission;
const confirmPublish = async (req, res) => {
    const { submissionId } = req.params;
    const submission = await contentSubmissionService.confirmPublish(req.currentUser.userId, submissionId, req.body.publishedUrl);
    return (0, response_1.sendSuccess)(res, submission, "Publish confirmation recorded");
};
exports.confirmPublish = confirmPublish;
