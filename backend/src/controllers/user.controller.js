import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  const refreshToken = await user.generateRefreshToken();
  const accessToken = await user.generateAccessToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { refreshToken, accessToken };
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, password, fullName, role, address, gender, specialization } =
    req.body;

  // if (
  //   [ email, password, fullName, role, address, gender].some(
  //     (field) => !field || field.trim() == ""
  //   )
  // ) {
  //   throw new ApiError(res, 400, "All fields are required");
  // }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res
      .status(409)
      .json(new ApiResponse(409, {}, "User already exists"));
  }

  const avatarLocalFilePath = req.files?.avatar?.[0]?.path;

  if (!avatarLocalFilePath) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Avatar file is required"));
  }

  const avatar = await uploadToCloudinary(avatarLocalFilePath);

  if (!avatar) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to upload avatar"));
  }

  if (role === "doctor" && !specialization) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Specialization is required for doctors"));
  }

  const userData = {
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
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          {},
          "Something went wrong while registering the user"
        )
      );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdUser, "User was registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json(new ApiResponse(400, {}, "Email is required"));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "User does not exist"));
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Invalid user credentials"));
  }

  try {
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
    return res
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
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          {},
          "Something went wrong while generating refresh and access token"
        )
      );
  }
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
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Unauthorized request"));
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Invalid refresh token"));
    }

    if (user?.refreshToken !== incomingRefreshToken) {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Refresh Token is invalid"));
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
    return res
      .status(401)
      .json(
        new ApiResponse(401, {}, error?.message || "Invalid refresh token")
      );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  const isPasswordValid = user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Invalid old password"));
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
  if (!fullName && !email && !gender && !address && !specialization) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Atleast one field is required"));
  }

  const updateQuery = {};

  const fieldsToUpdate = [email, fullName, gender, address];

  for (const [key, value] of Object.entries(fieldsToUpdate)) {
    if (value) {
      updateQuery[key] = value;
    }
  }

  if (req.user.role === "doctor" && updateData.specialization) {
    updateQuery.specialization = specialization;
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: updateQuery,
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const updatedAvatarLocalPath = req.file.path;

  if (!updatedAvatarLocalPath) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Avatar file is missing"));
  }

  const updatedAvatar = await uploadToCloudinary(updatedAvatarLocalPath);

  if (!updatedAvatar.url) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to upload avatar"));
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
  ).select("-password -refreshToken");

  if (!user) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to upload avatar"));
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
      return res.json({ authenticated: false });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.json({ authenticated: false });
    }

    return res.json({ authenticated: true });
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          {},
          error?.message || "Something went wrong while checking authentication"
        )
      );
  }
});

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
