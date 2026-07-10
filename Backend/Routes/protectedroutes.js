import express from "express";

import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} from "../Controllers/authController.js";

import { authenticateUser } from "../Middleware/authMiddleware.js";
import { authorizeRoles } from "../Middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/student-dashboard",
  authenticateUser,
  authorizeRoles("Student", "Admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to Student Dashboard",
      user: req.user,
    });
  }
);


router.get(
  "/teacher-dashboard",
  authenticateUser,
  authorizeRoles("Teacher", "Admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to Teacher Dashboard",
      user: req.user,
    });
  }
);


router.get(
  "/employer-dashboard",
  authenticateUser,
  authorizeRoles("Employer", "Admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to Employer Dashboard",
      user: req.user,
    });
  }
);


router.get(
  "/employee-dashboard",
  authenticateUser,
  authorizeRoles("Employee", "Admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to Employee Dashboard",
      user: req.user,
    });
  }
);


router.get(
  "/admin-dashboard",
  authenticateUser,
  authorizeRoles("Admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to Admin Dashboard",
      user: req.user,
    });
  }
);


router.get(
  "/users",
  authenticateUser,
  authorizeRoles("Admin"),
  getAllUsers
);


router.patch(
  "/users/:userId/role",
  authenticateUser,
  authorizeRoles("Admin"),
  updateUserRole
);


router.patch(
  "/users/:userId/status",
  authenticateUser,
  authorizeRoles("Admin"),
  updateUserStatus
);

export default router;