"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.listMessages = void 0;
const prisma_client_1 = __importDefault(require("../../prisma/prisma.client"));
const app_error_1 = require("../../common/errors/app-error");
const getOfferConversationForUser = async (userId, offerId) => {
    const offer = await prisma_client_1.default.offer.findFirst({
        where: {
            id: offerId,
            OR: [
                {
                    campaign: {
                        hirer: {
                            userId,
                        },
                    },
                },
                {
                    influencerProfile: {
                        userId,
                    },
                },
            ],
        },
        include: {
            conversation: {
                include: {
                    messages: {
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    role: true,
                                    phone: true,
                                    email: true,
                                },
                            },
                        },
                        orderBy: { createdAt: "asc" },
                    },
                },
            },
        },
    });
    if (!offer || !offer.conversation) {
        throw new app_error_1.AppError("Conversation not found", 404);
    }
    return offer.conversation;
};
const listMessages = async (userId, offerId) => {
    const conversation = await getOfferConversationForUser(userId, offerId);
    return conversation.messages;
};
exports.listMessages = listMessages;
const sendMessage = async (userId, offerId, input) => {
    const conversation = await getOfferConversationForUser(userId, offerId);
    return prisma_client_1.default.message.create({
        data: {
            conversationId: conversation.id,
            senderId: userId,
            content: input.content,
            attachmentUrl: input.attachmentUrl ?? null,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    role: true,
                    phone: true,
                    email: true,
                },
            },
        },
    });
};
exports.sendMessage = sendMessage;
