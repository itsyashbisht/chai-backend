import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getVideoById,
  publishAVideo,
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
router.route("/:videoId").get(verifyJWT, getVideoById);
router
  .route("/update-detials/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

export default router;
