import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.route("/video/:videoId").get(verifyJWT, getVideoComments);
router.route("/video/:videoId").post(verifyJWT, addComment);
router.route("/video/:commentId").patch(verifyJWT, updateComment);
router.route("video/:commentId").delete(verifyJWT, deleteComment);

export default router;
