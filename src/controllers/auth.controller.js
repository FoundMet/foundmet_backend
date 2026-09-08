import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import uploadFile from "../utils/imagekit.utils.js";
import bcrypt from "bcrypt";

async function createUser(req, res) {
  try {
    const {
      email,
      name,
      password,
      role,
      hasProject,
      projectDetails,
      projectLink,
      projectStatus,
      lookingFor,
      address,
    } = req.body;

    // Check required fields
    if (!email || !name || !password) {
      return res.status(400).json({
        message: "Email, name and password are required",
      });
    }

    // Check if user already exists
    const isUserExists = await UserModel.findOne({ email });

    if (isUserExists) {
      return res.status(403).json({
        message: "User account already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload profile photo if provided
    let photoUrl = null;

    if (req.file) {
      try {
        const result = await uploadFile(req.file.buffer);
        photoUrl = result?.url || null;
      } catch (uploadErr) {
        console.warn("Image upload warning:", uploadErr?.message || uploadErr);
      }
    }

    // Sanitize optional enum values
    let validProjectStatus = undefined;
    if (hasProject === "yes" && ["idea", "development", "execution"].includes(projectStatus)) {
      validProjectStatus = projectStatus;
    }

    let formattedLookingFor = [];
    if (Array.isArray(lookingFor)) {
      formattedLookingFor = lookingFor.filter((role) =>
        ["cto", "ceo", "cfo"].includes(role)
      );
    } else if (typeof lookingFor === "string" && ["cto", "ceo", "cfo"].includes(lookingFor)) {
      formattedLookingFor = [lookingFor];
    }

    // Create user
    const user = await UserModel.create({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      password: hashedPassword,
      role: ["founder", "co-founder"].includes(role) ? role : "founder",
      hasProject: hasProject === "yes" ? "yes" : "no",
      projectDetails: hasProject === "yes" && projectDetails ? projectDetails.trim() : undefined,
      projectLink: hasProject === "yes" && projectLink ? projectLink.trim() : undefined,
      projectStatus: validProjectStatus,
      lookingFor: formattedLookingFor,
      address: address ? address.trim() : undefined,
      photo: photoUrl,
    });

    // Create JWT
    const accessToken = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET || "foundmet_secret_key_123",
      {
        expiresIn: "7d",
      },
    );

    // Save access token
    user.accessToken = accessToken;
    await user.save();

    return res.status(201).json({
      message: "User account created successfully",
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasProject: user.hasProject,
        projectDetails: user.projectDetails,
        projectLink: user.projectLink,
        projectStatus: user.projectStatus,
        lookingFor: user.lookingFor,
        address: user.address,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error("Create User Error:", error);

    return res.status(500).json({
      message: error?.message || "Internal Server Error",
    });
  }
}

async function allUsers(req, res) {
    try {
        const users = await UserModel
            .find()
            .select(
                "name role hasProject projectDetails projectLink projectStatus lookingFor address photo createdAt"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Feed Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const accessToken = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET || "foundmet_secret_key_123",
      {
        expiresIn: "7d",
      }
    );

    user.accessToken = accessToken;
    await user.save();

    return res.status(200).json({
      message: "Logged in successfully",
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasProject: user.hasProject,
        projectDetails: user.projectDetails,
        projectLink: user.projectLink,
        projectStatus: user.projectStatus,
        lookingFor: user.lookingFor,
        address: user.address,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function getMe(req, res) {
  try {
    const user = await UserModel.findById(req.user._id).select(
      "name email role hasProject projectDetails projectLink projectStatus lookingFor address photo createdAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export { createUser, allUsers, loginUser, getMe };
