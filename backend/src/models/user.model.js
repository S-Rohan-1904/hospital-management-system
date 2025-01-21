import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    address: {
      type: String,
    },
    role: {
      type: String,
      enum: ["doctor", "patient", "scanCentre", "hospitalAdmin"],
      required: true,
    },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
    },
    googleId: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    specialization: {
      type: String,
      validate: {
        validator: function (value) {
          if (this.role === "doctor" && !value) {
            return false;
          }
          return true;
        },
        message: "Specialization is required for doctors",
      },
    },
    chatGroups: [
      {
        type: Schema.Types.ObjectId,
        ref: "ChatGroup",
      },
    ],
    medicalHistoryUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
