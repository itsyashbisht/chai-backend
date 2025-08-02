import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  //TODO: get all videos based on query, sort, pagination
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "asc", // asc or desc
    userId,
  } = req.query;

  if (!userId) throw new ApiError(400, "userId field is required");

  const settingSortType = sortType === "asc" ? -1 : 1;

  const videos = await Video.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $sort: {
        [sortBy]: settingSortType,
      },
    },
    {
      $skip: parseInt((page - 1) * 10),
    },
    {
      $limit: parseInt(limit),
    },
    {
      $project: {
        createdAt: 1,
        title: 1,
        isPublished: 1,
        views: 1,
        owner: 1,
      },
    },
  ]);

  console.log("Videos :", videos);

  if (!videos || videos === undefined || videos === null) {
    throw new ApiError(404, "Error fetching videos for the user.");
  }

  const totalVideos = await Video.countDocuments({ owner: userId });
  console.log("TotalVideos : ", totalVideos);

  if (totalVideos === undefined) {
    throw new ApiError(404, "No videos found for the user.");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        page,
        limit,
        totalPages: Math.ceil(totalVideos / limit),
        totalVideos,
        videos,
      },
      "Videos fetched successfully"
    )
  );
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

  if (!videoId) throw new ApiError(400, "Invalid video Id");

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Invalid video Id");
  console.log(req.body);

  const { isPublished } = req.body;

  if (!isPublished)
    throw new ApiError(400, "Publish status is required in request body");

  const toggleStatus = isPublished ? false : true;

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: toggleStatus,
      },
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video.isPublished,
        "Publish status toggled successfully"
      )
    );
});

export {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
};
