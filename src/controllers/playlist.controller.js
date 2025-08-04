import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  //TODO: create playlist
  const { name, description } = req.body;
  const userId = req.user?._id;

  if (!name || !userId)
    throw new ApiError(400, "Name and userId both fields are required.");

  const playlist = await Playlist.create({
    name,
    description,
    owner: userId,
  });

  if (!playlist) throw new ApiError(400, "Error creating the playlist");

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  //TODO: get user playlists
  const { _id: userId } = req.user;
  if (!userId) throw new ApiError(400, "User Id field is required.");

  const playlist = await Playlist.find({ owner: userId });

  if (!playlist) throw new ApiError(400, "Error fetching user's playlist");

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  //TODO: get playlist by id
  const { playlistId } = req.params;
  if (!playlistId) throw new ApiError(400, "Playlist Id field is required.");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(400, "Error fetching user's playlist");

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId)
    throw new ApiError(400, "PlaylistId and videoId fields are required.");
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
