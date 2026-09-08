import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Authentication
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },

    // Founder role
    role: {
      type: String,
      enum: ["founder", "co-founder"],
      default: "founder",
    },

    // Project information
    hasProject: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },

    projectDetails: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    projectLink: {
      type: String,
      trim: true,
    },

    projectStatus: {
      type: String,
      enum: ["idea", "development", "execution"],
    },

    // Looking for team members
    lookingFor: [
      {
        type: String,
        enum: ["cto", "ceo", "cfo"],
      },
    ],

    // Location
    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Profile photo
    photo: {
      type: String,
      default: null,
    },
    accessToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
