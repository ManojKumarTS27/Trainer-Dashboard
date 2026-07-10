import express from "express";

import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../Controllers/authController.js";

import { authenticateUser } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Logged-in user profile
router.get("/me", authenticateUser, getCurrentUser);

export default router;