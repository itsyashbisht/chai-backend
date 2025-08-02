import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/publish").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);
router.route("/allVideos").get(verifyJWT, getAllVideos);
router.route("/:videoId").get(verifyJWT, getVideoById);
router.route("/delete/:videoId").delete(verifyJWT, deleteVideo);
router
  .route("/update-details/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router.route("/isPublished/:videoId").get(verifyJWT, togglePublishStatus);

export default router;
