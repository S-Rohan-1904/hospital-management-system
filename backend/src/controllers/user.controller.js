import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(res, 
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  const {
    username,
    email,
    password,
    fullName,
    role,
    address,
    gender,
    specialization,
  } = req.body;

  // if (
  //   [username, email, password, fullName, role, address, gender].some(
  //     (field) => !field || field.trim() == ""
  //   )
  // ) {
  //   throw new ApiError(res, 400, "All fields are required");
  // }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existingUser) {
    throw new ApiError(res, 409, "User already exists");
  }

  const avatarLocalFilePath = req.files?.avatar?.[0]?.path;

  if (!avatarLocalFilePath) {
    throw new ApiError(res, 400, "Avatar file is required");
  }

  const avatar = await uploadToCloudinary(avatarLocalFilePath);

  if (!avatar) {
    throw new ApiError(res, 500, "Failed to upload avatar");
  }

  if (role === "doctor" && !specialization) {
    throw new ApiError(res, 400, "Specialization is required for doctors");
  }

  const userData = {
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    fullName: fullName.trim(),
    avatar: avatar.url,
    password,
    role,
    address,
    gender,
  };

  if (role === "doctor" && specialization) {
    userData.specialization = specialization;
  }

  const user = await User.create(userData);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(res, 500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdUser, "User was registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(res, 400, "username or email is required");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError(res, 404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(res, 401, "Invalid user credentials");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
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
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(res, 401, "Unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(res, 401, "Invalid refresh token");
    }

    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(res, 401, "Refresh Token is invalid");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { refreshToken: newRefreshToken, accessToken } =
      await generateAccessAndRefreshToken(decodedToken._id);

    res
      .status(200)
      .cookie("refreshToken", newRefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(res, 401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  const isPasswordValid = user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(res, 400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, gender, address, specialization } = req.body;
  if (!fullName && !email && !gender && !address) {
    throw new ApiError(res, 400, "Atleast one field is required");
  }

  const updateQuery = {};

  const fieldsToUpdate = [email, fullName, gender, address];

  for (const [key, value] of Object.entries(fieldsToUpdate)) {
    if (value) {
      updateQuery[key] = value;
    }
  }

  if (user.role === "doctor" && updateData.specialization) {
    updateQuery.specialization = specialization;
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: updateQuery,
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const updatedAvatarLocalPath = req.file.path;

  if (!updatedAvatarLocalPath) {
    throw new ApiError(res, 400, "Avatar file is missing");
  }

  const updatedAvatar = await uploadToCloudinary(updatedAvatarLocalPath);

  if (!updatedAvatar.url) {
    throw new ApiError(res, 500, "Failed to upload avatar");
  }

  const oldAvatar = req.user.avatar;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: updatedAvatar.url,
      },
    },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(res, 500, "Failed to update avatar");
  }

  if (oldAvatar) {
    const oldAvatarPublicId = oldAvatar.split("/").pop().split(".")[0];
    await deleteFromCloudinary(oldAvatarPublicId);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const checkAuthenicated = asyncHandler(async (req, res) => {
  try {
    const token = req.cookies?.accessToken;
  
    if (!token) {
      throw new ApiError(res, 401, "Unauthorized request");
    }
  
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
  
    if (!user) {
      return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {"authenicated":"true"},
          "Invalid Access Token"
        ))
    }
  
    return res
    .status(200)
    .json(new ApiResponse(200, {"authenicated":"true"}))
  } catch (error) {
    throw new ApiError(res, 401, error?.message || "Invalid access token");
  }
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  generateAccessAndRefreshToken,
  checkAuthenicated,
};
