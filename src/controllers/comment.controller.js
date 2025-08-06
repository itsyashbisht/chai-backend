import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { page = 1, limit = 10 } = req.query;
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "videoId field is required");

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $skip: parseInt((page - 1) * limit),
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  if (!comments) throw new ApiError(400, "Error fetching comments");
  const commentsCount = comments?.length;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        page,
        limit,
        totalPage: Math.ceil(commentsCount / limit),
        comments,
      },
      "Comments fetched successfully"
    )
  );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const userId = req.user?._id;
  const { videoId } = req.params;
  const { content } = req.body;
  if (!videoId || !userId || !content)
    throw new ApiError(400, "VideoId, userId and content fields are required.");

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  if (!comment) throw new ApiError(400, "Error adding comment");

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;
  if (!commentId || !content)
    throw new ApiError(400, "CommentId and content fields are required");

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      content,
    },
    {
      new: true,
    }
  );

  if (!updatedComment) throw new ApiError(400, "Error updating the comment.");

  return res
    .status(200)
    .json(new ApiResponse(200, updateComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId)
    throw new ApiError(400, "CommentId and content fields are required");

  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment) throw new ApiError(400, "Comment not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
