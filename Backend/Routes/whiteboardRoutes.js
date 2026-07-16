import express from "express";

import {
  clearSessionWhiteboard,
  getSessionWhiteboard,
  saveWhiteboardDrawing,
  updateWhiteboardDrawing,
} from "../Controllers/whiteboardController.js";

import {
  authenticateUser,
} from "../Middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateUser);

router.post(
  "/save",
  saveWhiteboardDrawing
);

router.get(
  "/:sessionId",
  getSessionWhiteboard
);

router.put(
  "/:sessionId",
  updateWhiteboardDrawing
);

router.delete(
  "/:sessionId",
  clearSessionWhiteboard
);

export default router;