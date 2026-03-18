import prisma from "../../prisma/prisma.client";
import { AppError } from "../../common/errors/app-error";

const getOfferConversationForUser = async (userId: string, offerId: string) => {
  const offer = await prisma.offer.findFirst({
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
    throw new AppError("Conversation not found", 404);
  }

  return offer.conversation;
};

export const listMessages = async (userId: string, offerId: string) => {
  const conversation = await getOfferConversationForUser(userId, offerId);
  return conversation.messages;
};

export const sendMessage = async (
  userId: string,
  offerId: string,
  input: {
    content: string;
    attachmentUrl?: string | null;
  },
) => {
  const conversation = await getOfferConversationForUser(userId, offerId);

  return prisma.message.create({
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
