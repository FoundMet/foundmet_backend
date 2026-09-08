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
      const result = await uploadFile(req.file.buffer);

      photoUrl = result?.url || null;
    }

    // Create user
    const user = await UserModel.create({
      email,
      name,
      password: hashedPassword,
      role,
      hasProject,
      projectDetails,
      projectLink,
      projectStatus,
      lookingFor,
      address,
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
      process.env.ACCESS_TOKEN_SECRET,
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
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error("Create User Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
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




export { createUser,allUsers };
