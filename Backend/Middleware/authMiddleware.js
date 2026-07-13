import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import process from "node:process";

export const authenticateUser = async (
  req,
  res,
  next
) => {
  try {
    console.log("All request headers:", req.headers);

    const authHeader =
      req.headers.authorization;

    console.log(
      "Authorization header:",
      authHeader
    );

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log(
      "Token received:",
      token ? "Yes" : "No"
    );

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.userId
    ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Account disabled. Please contact the administrator.",
      });
    }

    req.user = {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message:
          "Token expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message:
        "Invalid authentication token",
    });
  }
};