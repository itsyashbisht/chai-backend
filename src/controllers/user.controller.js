import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    // GENERATING ACCESS AND REFRESH TOKEN
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // SAVING REFRESH TOKEN IN DB
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // 1. GET USER DETAILS FROM FRONTEND.
  const { username, email, password, fullName } = req.body;

  // 2. VALIDATION - NOT EMPTY
  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 3. CHECK IF USER ALREADY EXISTS: USERNAME, EMAIL
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existedUser)
    throw new ApiError(409, "User with email or username already exists");

  // 4. CHECK FOR IMAGES , CHECK FOR AVATAR

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

  // 5. UPLOAD THEM TO CLOUDINARY, AVATAR
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  console.log(avatar);

  if (!avatar) throw new ApiError(400, "Avatar file is required");

  // 6. CREATE USER OBJECT - CREATE ENTRY IN DB
  const user = await User.create({
    email,
    fullName,
    password,
    avatar: avatar.url,
    username: username.toLowerCase(),
    coverImage: coverImage?.url || "",
  });

  // 7. REMOVE PASSWORD AND REFRESH TOKEN FIELD FROM RESPONSE
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 8. CHECK FOR USER CREATION
  if (!createdUser)
    throw new ApiError(500, "Something went wrong registering the user");

  // 9. RETURN RESPONSE
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // 1. TAKE DETAILS FROM USER (REQ BODY)
  const { email, username, password } = req.body;

  // 2. USERNAME OR EMAIL VALIDATE
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  // 3. FIND THE USER
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) throw new ApiError(404, "user does not exist");

  // 4. PASSWORD CHECK
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

  // 5. ACCESS AND REFRESH TOKEN
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // 6. SEND COOKIE
  const loggedInUser = await User.findById(user._id).select(
    " -password -refreshToken" // removing password and refresh token
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // 1. FIND USER
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req?.body.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // RETRIVING TOKEN FROM USER FROM DB
    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "Invalid refresh token");

    if (incomingRefreshToken !== user?.refreshToken)
      throw new ApiError(401, "Refresh token is expired or used");

    // GENERATING TOKEN
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    // SENDING TOKEN IN COOKIE
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
