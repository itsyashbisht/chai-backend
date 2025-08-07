import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user?._id;
  if (!userId) throw new ApiError(400, "userId field is required.");

  const videos = await Video.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $lookup: {
        from: "likes",
        foreignField: "video",
        localField: "_id",
        as: "liked",
        pipeline: [
          {
            $project: {
              video: 1,
              likedBy: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        title: 1,
        views: 1,
        totalLikes: { $size: "$liked" },
      },
    },
  ]);

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: {
        subscriber: 1,
      },
    },
  ]);

  if (!videos || !subscribers)
    throw new ApiError(400, "Error fetching channel statistics data");

  // CREATING DATA FIELDS FOR RESPONSE
  const totalSubscribers = subscribers?.length || null;
  const totalVideos = videos?.length || null;
  const totalViews = videos
    .map((v) => v.views)
    .reduce((acc, cur) => acc + cur, 0);

  const totalLikes = videos
    .map((v) => v.totalLikes)
    .reduce((acc, cur) => acc + cur, 0);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        subscribers,
        totalSubscribers,
        totalVideos,
        totalLikes,
        totalViews,
      },
      "Channels stats fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "asc", // asc or desc
  } = req.query;

  const { channelId } = req.params;
  if (!channelId)
    throw new ApiError(400, "channelId field is required in params.");

  const settingSortType = sortType === "asc" ? -1 : 1;
  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
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

  if (!videos || videos === undefined) {
    throw new ApiError(404, "Error fetching videos for the user.");
  }

  const totalVideos = await Video.countDocuments({ owner: channelId });
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

export { getChannelStats, getChannelVideos };
