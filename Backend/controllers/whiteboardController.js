import mongoose from "mongoose";

import Session from "../Models/Session.js";
import Whiteboard from "../Models/Whiteboard.js";

const ALLOWED_TOOLS = [
  "Pen",
  "Eraser",
  "Shape",
  "Text",
];

const isValidDrawingData = (
  drawingData
) => {
  return (
    drawingData !== null &&
    typeof drawingData === "object" &&
    !Array.isArray(drawingData) &&
    Object.keys(drawingData).length > 0
  );
};

const getSessionById = async (
  sessionId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      sessionId
    )
  ) {
    return {
      error: {
        status: 400,
        message:
          "Invalid Session ID",
      },
    };
  }

  const session =
    await Session.findById(
      sessionId
    );

  if (!session) {
    return {
      error: {
        status: 404,
        message:
          "Session not found",
      },
    };
  }

  return {
    session,
  };
};

const isAdmin = (user) => {
  return user?.role === "Admin";
};

const isTrainerOfSession = (
  session,
  userId
) => {
  if (!userId) {
    return false;
  }

  return (
    session.trainerId?.toString() ===
    userId.toString()
  );
};

const isParticipantOfSession = (
  session,
  user
) => {
  if (!user?.userId) {
    return false;
  }

  if (isAdmin(user)) {
    return true;
  }

  const userId =
    user.userId.toString();

  const isTrainer =
    isTrainerOfSession(
      session,
      userId
    );

  const isParticipant =
    Array.isArray(
      session.participants
    ) &&
    session.participants.some(
      (participantId) =>
        participantId.toString() ===
        userId
    );

  return (
    isTrainer ||
    isParticipant
  );
};

const validateDrawingPayload = ({
  drawingData,
  toolType,
  color,
  strokeWidth,
}) => {
  if (
    !isValidDrawingData(
      drawingData
    )
  ) {
    return (
      "Drawing data must be a non-empty JSON object"
    );
  }

  if (
    !toolType ||
    !ALLOWED_TOOLS.includes(
      toolType
    )
  ) {
    return (
      "Tool type must be Pen, Eraser, Shape or Text"
    );
  }

  if (
    color !== undefined &&
    (typeof color !== "string" ||
      !color.trim())
  ) {
    return (
      "Color must be a valid string"
    );
  }

  if (
    strokeWidth !== undefined &&
    (typeof strokeWidth !== "number" ||
      strokeWidth < 1 ||
      strokeWidth > 50)
  ) {
    return (
      "Stroke width must be between 1 and 50"
    );
  }

  return null;
};

export const saveWhiteboardDrawing =
  async (req, res) => {
    try {
      const {
        sessionId,
        drawingData,
        toolType,
        color,
        strokeWidth,
      } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message:
            "Session ID is required",
        });
      }

      const validationError =
        validateDrawingPayload({
          drawingData,
          toolType,
          color,
          strokeWidth,
        });

      if (validationError) {
        return res.status(400).json({
          success: false,
          message:
            validationError,
        });
      }

      const { session, error } =
        await getSessionById(
          sessionId
        );

      if (error) {
        return res
          .status(error.status)
          .json({
            success: false,
            message:
              error.message,
          });
      }

      if (
        !isParticipantOfSession(
          session,
          req.user
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not a participant of this session",
        });
      }

      const whiteboardDrawing =
        await Whiteboard.create({
          sessionId,
          userId:
            req.user.userId,
          drawingData,
          toolType,
          color:
            color?.trim() ||
            "#111827",
          strokeWidth:
            strokeWidth ?? 3,
          timestamp:
            new Date(),
        });

      return res.status(201).json({
        success: true,
        message:
          "Whiteboard drawing saved successfully",
        whiteboard:
          whiteboardDrawing,
      });
    } catch (error) {
      console.error(
        "Save whiteboard error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to save whiteboard drawing",
        error:
          error.message,
      });
    }
  };

export const getSessionWhiteboard =
  async (req, res) => {
    try {
      const { sessionId } =
        req.params;

      const { session, error } =
        await getSessionById(
          sessionId
        );

      if (error) {
        return res
          .status(error.status)
          .json({
            success: false,
            message:
              error.message,
          });
      }

      if (
        !isParticipantOfSession(
          session,
          req.user
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not a participant of this session",
        });
      }

      const drawings =
        await Whiteboard.find({
          sessionId,
        })
          .populate(
            "userId",
            "name email role"
          )
          .sort({
            timestamp: 1,
            createdAt: 1,
          });

      return res.status(200).json({
        success: true,
        message:
          "Whiteboard drawings retrieved successfully",
        count:
          drawings.length,
        sessionId,
        drawings,
      });
    } catch (error) {
      console.error(
        "Get whiteboard error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to retrieve whiteboard drawings",
        error:
          error.message,
      });
    }
  };

export const updateWhiteboardDrawing =
  async (req, res) => {
    try {
      const { sessionId } =
        req.params;

      const {
        drawingId,
        drawingData,
        toolType,
        color,
        strokeWidth,
      } = req.body;

      if (
        !drawingId ||
        !mongoose.Types.ObjectId.isValid(
          drawingId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid Drawing ID is required",
        });
      }

      const validationError =
        validateDrawingPayload({
          drawingData,
          toolType,
          color,
          strokeWidth,
        });

      if (validationError) {
        return res.status(400).json({
          success: false,
          message:
            validationError,
        });
      }

      const { session, error } =
        await getSessionById(
          sessionId
        );

      if (error) {
        return res
          .status(error.status)
          .json({
            success: false,
            message:
              error.message,
          });
      }

      if (
        !isParticipantOfSession(
          session,
          req.user
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not a participant of this session",
        });
      }

      const existingDrawing =
        await Whiteboard.findOne({
          _id: drawingId,
          sessionId,
        });

      if (!existingDrawing) {
        return res.status(404).json({
          success: false,
          message:
            "Whiteboard drawing not found",
        });
      }

      const isDrawingOwner =
        existingDrawing.userId.toString() ===
        req.user.userId.toString();

      const isTrainer =
        isTrainerOfSession(
          session,
          req.user.userId
        );

      const adminUser =
        isAdmin(req.user);

      if (
        !isDrawingOwner &&
        !isTrainer &&
        !adminUser
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can update only your own drawing",
        });
      }

      existingDrawing.drawingData =
        drawingData;

      existingDrawing.toolType =
        toolType;

      existingDrawing.color =
        color?.trim() ||
        existingDrawing.color;

      existingDrawing.strokeWidth =
        strokeWidth ??
        existingDrawing.strokeWidth;

      existingDrawing.timestamp =
        new Date();

      await existingDrawing.save();

      return res.status(200).json({
        success: true,
        message:
          "Whiteboard drawing updated successfully",
        whiteboard:
          existingDrawing,
      });
    } catch (error) {
      console.error(
        "Update whiteboard error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update whiteboard drawing",
        error:
          error.message,
      });
    }
  };

export const clearSessionWhiteboard =
  async (req, res) => {
    try {
      const { sessionId } =
        req.params;

      const { session, error } =
        await getSessionById(
          sessionId
        );

      if (error) {
        return res
          .status(error.status)
          .json({
            success: false,
            message:
              error.message,
          });
      }

      const isTrainer =
        isTrainerOfSession(
          session,
          req.user.userId
        );

      const adminUser =
        isAdmin(req.user);

      if (
        !isTrainer &&
        !adminUser
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only the assigned Trainer or Admin can clear the whiteboard",
        });
      }

      const result =
        await Whiteboard.deleteMany({
          sessionId,
        });

      return res.status(200).json({
        success: true,
        message:
          "Whiteboard cleared successfully",
        deletedCount:
          result.deletedCount,
      });
    } catch (error) {
      console.error(
        "Clear whiteboard error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to clear whiteboard",
        error:
          error.message,
      });
    }
  };