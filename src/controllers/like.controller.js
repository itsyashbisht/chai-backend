import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on video
  const { videoId } = req.params;
  const { _id: userId } = req.user;
  if (!videoId || !userId)
    throw new ApiError(400, "VideoId and userId both fields are required.");

  // CONSTRUCTING DB QUERY
  const query = {
    likedBy: userId,
    video: videoId,
  };

  // TOGGLE STATUS
  const alreadyLiked = await Like.findOne(query);
  if (alreadyLiked) {
    await Like.deleteOne(query);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          video: query,
          likedStatus: false,
        },
        "Video unliked successfully"
      )
    );
  } else {
    await Like.create(query);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          video: query,
          likedStatus: true,
        },
        "Video liked successfully"
      )
    );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on comment
  const { commentId } = req.params;
  const { _id: userId } = req.user;
  if (!commentId || !userId)
    throw new ApiError(400, "commentId and userId both fields are required.");

  // CONSTRUCTING DB QUERY
  const query = {
    likedBy: userId,
    comment: commentId,
  };

  // TOGGLE STATUS
  const alreadyLiked = await Like.findOne(query);
  if (alreadyLiked) {
    await Like.deleteOne(query);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          comment: query,
          likedStatus: false,
        },
        "Comment unliked successfully"
      )
    );
  } else {
    await Like.create(query);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          comment: query,
          likedStatus: true,
        },
        "Comment liked successfully"
      )
    );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on tweet
  const { tweetId } = req.params;
  const { _id: userId } = req.user;
  if (!tweetId || !userId)
    throw new ApiError(400, "tweetId and userId both fields are required.");

  // CONSTRUCTING DB QUERY
  const query = {
    likedBy: userId,
    tweet: tweetId,
  };

  // TOGGLE STATUS
  const alreadyLiked = await Like.findOne(query);
  if (alreadyLiked) {
    await Like.deleteOne(query);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          tweet: query,
          likedStatus: false,
        },
        "Tweet unliked successfully"
      )
    );
  } else {
    await Like.create(query);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          tweet: query,
          likedStatus: true,
        },
        "Tweet liked successfully"
      )
    );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user?._id;
  if (!userId) throw new ApiError(400, "userId field is required");

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
        video: { $ne: null },
      },
    },
    {
      // JOINING VIDEO AND LIKE DB COLLECTION
      $lookup: {
        from: "videos", // COLLECTION NAME AS PER DB
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $unwind: "$videoDetails", // FLATTENS THE ARRAY
    },
    {
      $replaceRoot: { newRoot: "$videoDetails" }, // return only the video objects
    },
  ]);
  if (!likedVideos) throw new ApiError(400, "Error fetching liked videos");

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
