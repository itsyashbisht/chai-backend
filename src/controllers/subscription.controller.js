import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // TODO: toggle subscription
  const { channelId } = req.params;
  const { _id: userId } = req.user;
  if (!channelId || !userId)
    throw new ApiError(400, "channelId and userId both fields are required.");

  const query = {
    subscriber: userId,
  };

  const subscribed = await Subscription.findOne(query);
  if (subscribed) {
    await Subscription.deleteOne(query);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isSubscribed: false,
        },
        "Unsubscribed"
      )
    );
  } else {
    const channel = await Subscription.create(query);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          channel,
          isSubscribed: true,
        },
        "Subscribed"
      )
    );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) throw new ApiError(400, "ChannelId is required in params");

  const channelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
  ]);
  if (!channelSubscribers)
    throw new ApiError(400, "Error fetching channel subscribers");

  return res
    .status(200)
    .json(
      new ApiError(
        200,
        channelSubscribers,
        "Channel subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) throw new ApiError(400, "ChannelId is required in params");

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(subscriberId),
      },
    },
  ]);
  if (!subscribedChannels)
    throw new ApiError(400, "Error fetching channel subscribers");

  return res
    .status(200)
    .json(
      new ApiError(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
