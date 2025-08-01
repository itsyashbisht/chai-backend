import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description)
    throw new ApiError(400, "Title and description are required");

  // GET VIDEO-PATHS FROM REQ.FILES
  const videoLocalPath = req.files?.video[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath)
    throw new ApiError(400, "Both Video and thumbnail fields are required");

  // UPLOAD ON CLOUDINARY
  const videoToUpload = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoToUpload || !thumbnail)
    throw new ApiError(400, "Error uploading video or thumbnail to Cloudinary");

  // CREATE VIDEO OBJECT - ENTERY IN DB
  const video = await Video.create({
    title,
    description,
    videoFile: videoToUpload.url,
    thumbnail: thumbnail.url,
    duration: videoToUpload.duration,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  // TOD0: GET VIDEO BY ID
  const { videoId } = req.params;

  if (!videoId) throw new ApiError(400, "Invalid video Id");

  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(400, "No video found");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Invalid video Id");

  // GET DETAILS FROM REQ-BODY
  console.log(req.body);
  console.log(req.file.path);
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!title || !description || !thumbnailLocalPath)
    throw new ApiError(
      400,
      "Title, description, and thumbnail are required for update"
    );

  // UPLOAD THUMBNAIL ON CLOUDINARY
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail.url)
    throw new ApiError(400, "Error uploading thumbnail to Cloudinary");

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnail.url,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video details updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
};
