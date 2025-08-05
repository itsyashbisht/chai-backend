import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createPlaylist);
router.route("/:user-playlists").get(verifyJWT, getUserPlaylists);
router.route("/:playlistId").get(verifyJWT, getPlaylistById);
router.route("/update/:playlistId").patch(verifyJWT, updatePlaylist);
router
  .route("/:playlistId/add/video/:videoId")
  .post(verifyJWT, addVideoToPlaylist);
router
  .route("/:playlistId/remove/video/:videoId")
  .delete(verifyJWT, removeVideoFromPlaylist);
router.route("/delete/:playlistId").delete(verifyJWT, deletePlaylist);

export default router;
