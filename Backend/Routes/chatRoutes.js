import express from "express";

import {
  body,
  param,
} from "express-validator";

import {
  sendMessage,
  getSessionMessages,
  deleteMessage,
} from "../Controllers/chatController.js";

import {
  authenticateUser,
} from "../Middleware/authMiddleware.js";

import {
  authorizeRoles,
} from "../Middleware/roleMiddleware.js";

import validateRequest from "../Middleware/validateRequest.js";

const router = express.Router();

const allowedMessageTypes = [
  "Text",
  "File",
];

/*
POST /api/chat/send
*/
router.post(
  "/send",

  authenticateUser,

  authorizeRoles(
    "Student",
    "Teacher",
    "Admin"
  ),

  [
    body("sessionId")
      .notEmpty()
      .withMessage(
        "Session ID is required"
      )
      .bail()
      .isMongoId()
      .withMessage(
        "Invalid session ID"
      ),

    body("messageType")
      .optional()
      .isIn(
        allowedMessageTypes
      )
      .withMessage(
        "Message type must be Text or File"
      ),

    body("message")
      .optional({
        nullable: true,
      })
      .isString()
      .withMessage(
        "Message must be text"
      )
      .bail()
      .isLength({
        max: 1000,
      })
      .withMessage(
        "Message cannot exceed 1000 characters"
      ),

    body("fileUrl")
      .optional({
        nullable: true,
      })
      .isString()
      .withMessage(
        "File URL must be text"
      ),

    body().custom(
      (requestBody) => {
        const messageType =
          requestBody.messageType ||
          "Text";

        const message =
          typeof requestBody.message ===
          "string"
            ? requestBody.message.trim()
            : "";

        const fileUrl =
          typeof requestBody.fileUrl ===
          "string"
            ? requestBody.fileUrl.trim()
            : "";

        if (
          messageType === "Text" &&
          !message
        ) {
          throw new Error(
            "Message cannot be empty"
          );
        }

        if (
          messageType === "File" &&
          !fileUrl
        ) {
          throw new Error(
            "File URL is required for file messages"
          );
        }

        return true;
      }
    ),
  ],

  validateRequest,

  sendMessage
);

/*
GET /api/chat/session/:sessionId
*/
router.get(
  "/session/:sessionId",

  authenticateUser,

  authorizeRoles(
    "Student",
    "Teacher",
    "Admin"
  ),

  [
    param("sessionId")
      .isMongoId()
      .withMessage(
        "Invalid session ID"
      ),
  ],

  validateRequest,

  getSessionMessages
);

/*
DELETE /api/chat/:messageId
*/
router.delete(
  "/:messageId",

  authenticateUser,

  authorizeRoles(
    "Teacher",
    "Admin"
  ),

  [
    param("messageId")
      .isMongoId()
      .withMessage(
        "Invalid message ID"
      ),
  ],

  validateRequest,

  deleteMessage
);

export default router;