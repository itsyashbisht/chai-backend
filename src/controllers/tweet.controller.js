import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //1. GET CONTENT AND USER-ID FROM REQ
  console.log(req.body);
  const { content } = req.body;
  const userId = req.user?._id;

  //   VALIDATE THEM
  if (!content || !userId)
    throw new ApiError(400, "Content and userId fields are required.");

  //   CREATING TWEET - ENTERY IN DB
  const tweet = await Tweet.create({
    content,
    owner: userId,
  });

  if (!tweet) throw ApiError(400, "Error creating the tweet");

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const userId = req.user?._id;
  if (!userId) throw new ApiError(400, "userId field is required.");

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
  ]);

  if (tweets === undefined || tweets === null) {
    throw new ApiError(404, "Error fetching tweets");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!tweetId || !content)
    throw new ApiError(400, "Content and tweetId fields are required.");

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!tweet) throw new ApiError(400, "Error updating the tweet");

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!tweetId) throw new ApiError(400, "tweetId field is required.");

  await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
