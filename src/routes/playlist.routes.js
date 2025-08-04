import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createPlaylist);
router.route("/:user-playlists").get(verifyJWT, getUserPlaylists);
router.route("/:playlistId").get(verifyJWT, getPlaylistById);

export default router;
