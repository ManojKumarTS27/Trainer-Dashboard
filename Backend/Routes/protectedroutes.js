import express from "express";

import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} from "../Controllers/authController.js";

import { authenticateUser } from "../Middleware/authMiddleware.js";
import { authorizeRoles } from "../Middleware/roleMiddleware.js";

const router = express.Router();

/*
====================================================
Student Dashboard
Student + Admin
====================================================
*/
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

/*
====================================================
Teacher Dashboard
Teacher + Admin
====================================================
*/
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

/*
====================================================
Employer Dashboard
Employer + Admin
====================================================
*/
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

/*
====================================================
Employee Dashboard
Employee + Admin
====================================================
*/
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

/*
====================================================
Admin Dashboard
Only Admin
====================================================
*/
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

/*
====================================================
Admin - Get All Users
====================================================
*/
router.get(
  "/users",
  authenticateUser,
  authorizeRoles("Admin"),
  getAllUsers
);

/*
====================================================
Admin - Update User Role
====================================================
*/
router.patch(
  "/users/:userId/role",
  authenticateUser,
  authorizeRoles("Admin"),
  updateUserRole
);

/*
====================================================
Admin - Enable / Disable User
====================================================
*/
router.patch(
  "/users/:userId/status",
  authenticateUser,
  authorizeRoles("Admin"),
  updateUserStatus
);

export default router;