import express from "express";

import {
  body,
  param,
} from "express-validator";

import {
  markAttendance,
  getAttendanceBySession,
  getAttendanceByStudent,
  updateAttendance,
} from "../Controllers/attendanceController.js";

import { authenticateUser } from "../Middleware/authMiddleware.js";
import { authorizeRoles } from "../Middleware/roleMiddleware.js";
import validateRequest from "../Middleware/validateRequest.js";

const router = express.Router();

const attendanceStatuses = [
  "Present",
  "Late",
  "Absent",
  "Excused",
];

const validateOptionalDate = (
  fieldName,
  displayName
) => {
  return body(fieldName)
    .optional({
      nullable: true,
    })
    .isISO8601()
    .withMessage(
      `${displayName} must be a valid ISO date`
    );
};

/*
  POST /api/attendance/mark
*/
router.post(
  "/mark",

  authenticateUser,

  authorizeRoles(
    "Student",
    "Teacher",
    "Admin"
  ),

  [
    body("sessionId")
      .notEmpty()
      .withMessage("Session ID is required")
      .bail()
      .isMongoId()
      .withMessage("Invalid session ID"),

    body("userId")
      .optional()
      .isMongoId()
      .withMessage("Invalid user ID"),

    validateOptionalDate(
      "joinTime",
      "Join time"
    ),

    validateOptionalDate(
      "leaveTime",
      "Leave time"
    ),

    body("status")
      .optional()
      .isIn(attendanceStatuses)
      .withMessage(
        `Status must be one of: ${attendanceStatuses.join(
          ", "
        )}`
      ),

    body().custom((requestBody) => {
      if (
        requestBody.joinTime &&
        requestBody.leaveTime
      ) {
        const joinTime = new Date(
          requestBody.joinTime
        );

        const leaveTime = new Date(
          requestBody.leaveTime
        );

        if (leaveTime < joinTime) {
          throw new Error(
            "Leave time cannot be earlier than join time"
          );
        }
      }

      return true;
    }),
  ],

  validateRequest,

  markAttendance
);

/*
  GET /api/attendance/session/:sessionId
*/
router.get(
  "/session/:sessionId",

  authenticateUser,

  authorizeRoles(
    "Teacher",
    "Admin"
  ),

  [
    param("sessionId")
      .isMongoId()
      .withMessage("Invalid session ID"),
  ],

  validateRequest,

  getAttendanceBySession
);

/*
  GET /api/attendance/student/:studentId
*/
router.get(
  "/student/:studentId",

  authenticateUser,

  authorizeRoles(
    "Student",
    "Teacher",
    "Admin"
  ),

  [
    param("studentId")
      .isMongoId()
      .withMessage("Invalid student ID"),
  ],

  validateRequest,

  getAttendanceByStudent
);

/*
  PUT /api/attendance/update
*/
router.put(
  "/update",

  authenticateUser,

  authorizeRoles(
    "Student",
    "Teacher",
    "Admin"
  ),

  [
    body("attendanceId")
      .optional()
      .isMongoId()
      .withMessage(
        "Invalid attendance ID"
      ),

    body("userId")
      .optional()
      .isMongoId()
      .withMessage("Invalid user ID"),

    body("sessionId")
      .optional()
      .isMongoId()
      .withMessage("Invalid session ID"),

    validateOptionalDate(
      "joinTime",
      "Join time"
    ),

    validateOptionalDate(
      "leaveTime",
      "Leave time"
    ),

    body("status")
      .optional()
      .isIn(attendanceStatuses)
      .withMessage(
        `Status must be one of: ${attendanceStatuses.join(
          ", "
        )}`
      ),

    body().custom((requestBody, { req }) => {
      const hasAttendanceId =
        Boolean(requestBody.attendanceId);

      const isStudent =
        req.user?.role === "Student";

      const hasRequiredLookupFields =
        isStudent
          ? Boolean(requestBody.sessionId)
          : Boolean(requestBody.userId) &&
            Boolean(requestBody.sessionId);

      if (
        !hasAttendanceId &&
        !hasRequiredLookupFields
      ) {
        throw new Error(
          isStudent
            ? "Provide attendanceId or sessionId"
            : "Provide attendanceId or both userId and sessionId"
        );
      }

      if (
        requestBody.joinTime &&
        requestBody.leaveTime
      ) {
        const joinTime = new Date(
          requestBody.joinTime
        );

        const leaveTime = new Date(
          requestBody.leaveTime
        );

        if (leaveTime < joinTime) {
          throw new Error(
            "Leave time cannot be earlier than join time"
          );
        }
      }

      return true;
    }),
  ],

  validateRequest,

  updateAttendance
);

export default router;