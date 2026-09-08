import jwt from "jsonwebtoken";

/**
 * Authentication Middleware to verify JWT token
 * Prevents unauthorized requests from unauthenticated clients
 */
export const verifyAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.accessToken ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null) ||
      req.headers["x-access-token"];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in or create an account.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || "foundmet_secret_key_123"
    );

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired session. Please log in again.",
    });
  }
};
