import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Hospital } from "../models/hospital.model.js";
import { ChatGroup } from "../models/chatGroup.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const getUserChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const userObject = await User.findById(userId, "-password -refreshToken")
      .populate("chatGroups")
      .exec();

    const chats = userObject.chatGroups;

    for (const chat of chats) {
      if (!chat.groupchat) {
        const recipient = await User.findOne({
          _id: { $ne: userId },
          chatGroups: chat._id,
        });
    
        if (recipient) {
          chat.title = recipient.fullName;
        }
      }
    }    

    return res
      .status(200)
      .json(
        new ApiResponse(200, chats, "Chats have been successfully fetched")
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(500, {}, "Something went wrong while fetching chats")
      );
  }
});

const createChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "UserId is required."));
  }

  try {
    const groupChat = await ChatGroup.create({
      title: "",
      groupchat: false,
    });

    const users = [req.user._id, userId];

    for (let index = 0; index < users.length; index++) {
      const user = users[index];
      await User.findByIdAndUpdate(user, {
        $push: {
          chatGroups: groupChat._id,
        },
      });
    }

    const receiver = await User.findById(userId).select("fullName");

    groupChat.title =  receiver.fullName;

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          groupChat,
          "Individual chat has been created"
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          {},
          error.message || "Something went wrong while creating chats"
        )
      );
  }

});

const getChatUsersBasedOnRole = asyncHandler(async (req, res) => {
  const { role } = req.user;

  try {
    let users;

    if (role === "doctor") {
      users = await User.find(
        { role: { $in: ["patient", "scanCentre"] } },
        "-password -refreshToken"
      );
    } else if (role === "patient") {
      users = await User.find({ role: "doctor" }, "-password -refreshToken");
    } else if (role === "scanCentre") {
      users = await User.find({ role: "doctor" }, "-password -refreshToken");
    } else {
      return res
        .status(403)
        .json(new ApiResponse(403, {}, "Forbidden request"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, users, "Users have been successfully fetched")
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          {},
          error.message || "Something went wrong while fetching users"
        )
      );
  }
});

const createSpecializationChat = asyncHandler(async (req, res) => {
  const { role } = req.user;
  const { specialization } = req.body;

  if (!specialization) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Specialization is required."));
  }

  if (role === "doctor" && specialization) {
    const { _id } = req.user;

    try {
      const hospital = await Hospital.findOne({ doctors: _id }).populate(
        "doctors"
      );

      const groupChatDoctors = [];

      for (let index = 0; index < hospital.doctors.length; index++) {
        const doctor = hospital.doctors[index];

        if (
          doctor.specialization.toLowerCase() === specialization.toLowerCase()
        ) {
          groupChatDoctors.push(doctor);
        }
      }

      if (groupChatDoctors.length === 0) {
        return res
          .status(404)
          .json(
            new ApiResponse(
              404,
              {},
              "No doctors found with this specialization"
            )
          );
      }

      const groupChat = await ChatGroup.create({
        title: specialization,
        groupchat: true,
      });

      const bulkOps = groupChatDoctors.map((update) => ({
        updateOne: {
          filter: { _id: update._id },
          update: {
            $push: {
              chatGroups: groupChat._id,
            },
          },
        },
      }));

      const result = await User.bulkWrite(bulkOps);

      return res
        .status(201)
        .json(new ApiResponse(201, groupChat, "Group chat has been created"));
    } catch (error) {
      return res
        .status(500)
        .json(
          new ApiResponse(
            500,
            {},
            error.message || "Something went wrong while creating chats"
          )
        );
    }
  } 
});

export { getUserChats, createChat, getChatUsersBasedOnRole, createSpecializationChat };
