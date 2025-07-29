import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

export { registerUser };
