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

  // GETTING PLAYLIST FROM DB
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(400, "Error fetching the playlist.");

  // CHECKING
  const alreadyExists = playlist?.videos?.includes(videoId);
  if (alreadyExists)
    throw new ApiError(400, "This video already exists in the playlist.");

  // PUSHING VIDEO-ID IN THE VIDEOS ARRAY
  playlist?.videos?.push(videoId);

  // SAVING IN DB
  const updatedPlaylist = await playlist.save();
  if (!updatedPlaylist)
    throw new ApiError(400, "Error saving the added video in the playlist.");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video added to playlist successfully."
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  // TODO: remove video from playlist
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId)
    throw new ApiError(400, "PlaylistId and videoId fields are required.");

  // GETTING PLAYLIST FROM DB
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(400, "Error fetching the playlist.");

  // CHECKING
  const alreadyExists = playlist?.videos?.includes(videoId);
  if (!alreadyExists) throw new ApiError(400, "Video not found in playlist.");

  //
  playlist.videos = playlist?.videos?.filter(
    (video) => video._id.toString() !== videoId
  );
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Video removed from playlist successfully.")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  // TODO: delete playlist
  const { playlistId } = req.params;
  if (!playlistId) throw new ApiError(400, "Playlist id is required.");

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletePlaylist) throw new ApiError(404, "Playlist not found.");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  //TODO: update playlist
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!name || !playlistId || !description)
    throw new ApiError(
      400,
      "Name,description and playlistId all fields are required."
    );

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    }
  );

  if (!playlist) throw new ApiError(400, "Error updating playlist");

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully."));
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
