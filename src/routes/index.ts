import { Router } from "express";

import applicationRouter from "../modules/applications/application.routes";
import authRouter from "../modules/auth/auth.routes";
import campaignRouter from "../modules/campaigns/campaign.routes";
import contentSubmissionRouter from "../modules/content-submissions/content-submission.routes";
import hirerRouter from "../modules/hirers/hirer.routes";
import historyRouter from "../modules/history/history.routes";
import influencerRouter from "../modules/influencers/influencer.routes";
import messageRouter from "../modules/messages/message.routes";
import notificationRouter from "../modules/notifications/notification.routes";
import offerRouter from "../modules/offers/offer.routes";
import paymentRouter from "../modules/payments/payment.routes";
import reviewRouter from "../modules/reviews/review.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/hirers", hirerRouter);
apiRouter.use("/influencers", influencerRouter);
apiRouter.use("/campaigns", campaignRouter);
apiRouter.use("/", applicationRouter);
apiRouter.use("/offers", offerRouter);
apiRouter.use("/", messageRouter);
apiRouter.use("/", contentSubmissionRouter);
apiRouter.use("/", paymentRouter);
apiRouter.use("/", reviewRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/history", historyRouter);

export default apiRouter;
