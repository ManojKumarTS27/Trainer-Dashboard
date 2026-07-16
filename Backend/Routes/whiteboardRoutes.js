import express from "express";

import {
  clearSessionWhiteboard,
  getSessionWhiteboard,
  saveWhiteboardDrawing,
  updateWhiteboardDrawing,
} from "../controllers/whiteboardController.js";

import {
  authenticateUser,
} from "../Middleware/authMiddleware.js";

const router = express.Router();

/*
 * Every whiteboard API requires
 * JWT authentication.
 */
router.use(authenticateUser);

/*
 * POST /api/whiteboard/save
 */
router.post(
  "/save",
  saveWhiteboardDrawing
);

/*
 * GET /api/whiteboard/:sessionId
 */
router.get(
  "/:sessionId",
  getSessionWhiteboard
);

/*
 * PUT /api/whiteboard/:sessionId
 */
router.put(
  "/:sessionId",
  updateWhiteboardDrawing
);

/*
 * DELETE /api/whiteboard/:sessionId
 */
router.delete(
  "/:sessionId",
  clearSessionWhiteboard
);

export default router;