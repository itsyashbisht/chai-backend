import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";

const router = Router();

router.route("/video/:videoId").get(verifyJWT, toggleVideoLike);
router.route("/comment/:commentId").get(verifyJWT, toggleCommentLike);
router.route("/tweet/:tweetId").get(verifyJWT, toggleTweetLike);
router.route("/all-videos").get(verifyJWT, getLikedVideos);

export default router;
