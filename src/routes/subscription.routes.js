import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();

router.route("/toggle/:channelId").get(verifyJWT, toggleSubscription);
router
  .route("/channel/:channelId/subscriber")
  .get(verifyJWT, getUserChannelSubscribers);
router
  .route("/channels/subscribed/:subscriberId")
  .get(verifyJWT, getSubscribedChannels);

export default router;
