import mongoose from "mongoose";

import Session from "../Models/Session.js";
import Whiteboard from "../Models/Whiteboard.js";

const ALLOWED_TOOLS = [
  "Pen",
  "Eraser",
  "Shape",
  "Text",
];

/*
|--------------------------------------------------------------------------
| Helper functions
|--------------------------------------------------------------------------
*/

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const isValidDrawingData = (drawingData) => {
  return (
    drawingData !== null &&
    typeof drawingData === "object" &&
    !Array.isArray(drawingData) &&
    Object.keys(drawingData).length > 0
  );
};

const findSession = async (sessionId) => {
  if (!isValidObjectId(sessionId)) {
    return {
      error: {
        status: 400,
        message: "Invalid Session ID",
      },
    };
  }

  const session = await Session.findById(
    sessionId
  );

  if (!session) {
    return {
      error: {
        status: 404,
        message: "Session not found",
      },
    };
  }

  return {
    session,
  };
};

const isSessionTrainer = (
  session,
  userId
) => {
  if (!session?.trainerId || !userId) {
    return false;
  }

  return (
    session.trainerId.toString() ===
    userId.toString()
  );
};

const isSessionParticipant = (
  session,
  userId
) => {
  if (!userId) {
    return false;
  }

  /*
   * The assigned trainer is automatically
   * allowed to access the session.
   */
  if (
    isSessionTrainer(
      session,
      userId
    )
  ) {
    return true;
  }

  return session.participants.some(
    (participantId) =>
      participantId.toString() ===
      userId.toString()
  );
};

const validateDrawingPayload = ({
  drawingData,
  toolType,
  color,
  strokeWidth,
}) => {
  if (!isValidDrawingData(drawingData)) {
    return (
      "Drawing data must be a non-empty JSON object"
    );
  }

  if (
    !toolType ||
    !ALLOWED_TOOLS.includes(toolType)
  ) {
    return (
      "Tool type must be Pen, Eraser, Shape, or Text"
    );
  }

  if (
    color !== undefined &&
    (typeof color !== "string" ||
      color.trim() === "")
  ) {
    return "Color must be a valid string";
  }

  if (
    strokeWidth !== undefined &&
    (typeof strokeWidth !== "number" ||
      Number.isNaN(strokeWidth) ||
      strokeWidth < 1 ||
      strokeWidth > 50)
  ) {
    return (
      "Stroke width must be a number between 1 and 50"
    );
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| POST /api/whiteboard/save
| Save whiteboard drawing
|--------------------------------------------------------------------------
*/

export const saveWhiteboardDrawing = async (
  req,
  res
) => {
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
        message: "Session ID is required",
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
        message: validationError,
      });
    }

    const {
      session,
      error: sessionError,
    } = await findSession(sessionId);

    if (sessionError) {
      return res
        .status(sessionError.status)
        .json({
          success: false,
          message: sessionError.message,
        });
    }

    if (
      !isSessionParticipant(
        session,
        req.user.userId
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
        userId: req.user.userId,
        drawingData,
        toolType,
        color: color?.trim() || "#111827",
        strokeWidth: strokeWidth ?? 3,
        timestamp: new Date(),
      });

    const populatedDrawing =
      await Whiteboard.findById(
        whiteboardDrawing._id
      ).populate(
        "userId",
        "name email role"
      );

    return res.status(201).json({
      success: true,
      message:
        "Whiteboard drawing saved successfully",
      whiteboard: populatedDrawing,
    });
  } catch (error) {
    console.error(
      "Save whiteboard drawing error:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(
          error.errors
        ).map(
          (validationError) =>
            validationError.message
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to save whiteboard drawing",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/whiteboard/:sessionId
| Retrieve session whiteboard drawings
|--------------------------------------------------------------------------
*/

export const getSessionWhiteboard = async (
  req,
  res
) => {
  try {
    const { sessionId } = req.params;

    const {
      session,
      error: sessionError,
    } = await findSession(sessionId);

    if (sessionError) {
      return res
        .status(sessionError.status)
        .json({
          success: false,
          message: sessionError.message,
        });
    }

    if (
      !isSessionParticipant(
        session,
        req.user.userId
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
      count: drawings.length,
      drawings,
    });
  } catch (error) {
    console.error(
      "Get whiteboard drawings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve whiteboard drawings",
    });
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/whiteboard/:sessionId
| Update an existing drawing
|--------------------------------------------------------------------------
*/

export const updateWhiteboardDrawing = async (
  req,
  res
) => {
  try {
    const { sessionId } = req.params;

    const {
      drawingId,
      drawingData,
      toolType,
      color,
      strokeWidth,
    } = req.body;

    if (
      !drawingId ||
      !isValidObjectId(drawingId)
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
        message: validationError,
      });
    }

    const {
      session,
      error: sessionError,
    } = await findSession(sessionId);

    if (sessionError) {
      return res
        .status(sessionError.status)
        .json({
          success: false,
          message: sessionError.message,
        });
    }

    if (
      !isSessionParticipant(
        session,
        req.user.userId
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a participant of this session",
      });
    }

    const drawing =
      await Whiteboard.findOne({
        _id: drawingId,
        sessionId,
      });

    if (!drawing) {
      return res.status(404).json({
        success: false,
        message:
          "Whiteboard drawing not found",
      });
    }

    const isDrawingOwner =
      drawing.userId.toString() ===
      req.user.userId.toString();

    const isTrainer =
      isSessionTrainer(
        session,
        req.user.userId
      );

    if (
      !isDrawingOwner &&
      !isTrainer
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can update only your own drawing",
      });
    }

    drawing.drawingData =
      drawingData;

    drawing.toolType =
      toolType;

    drawing.color =
      color?.trim() || "#111827";

    drawing.strokeWidth =
      strokeWidth ?? 3;

    drawing.timestamp =
      new Date();

    await drawing.save();

    const populatedDrawing =
      await Whiteboard.findById(
        drawing._id
      ).populate(
        "userId",
        "name email role"
      );

    return res.status(200).json({
      success: true,
      message:
        "Whiteboard drawing updated successfully",
      whiteboard: populatedDrawing,
    });
  } catch (error) {
    console.error(
      "Update whiteboard drawing error:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(
          error.errors
        ).map(
          (validationError) =>
            validationError.message
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to update whiteboard drawing",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/whiteboard/:sessionId
| Clear entire whiteboard - assigned trainer only
|--------------------------------------------------------------------------
*/

export const clearSessionWhiteboard = async (
  req,
  res
) => {
  try {
    const { sessionId } = req.params;

    const {
      session,
      error: sessionError,
    } = await findSession(sessionId);

    if (sessionError) {
      return res
        .status(sessionError.status)
        .json({
          success: false,
          message: sessionError.message,
        });
    }

    /*
     * Requirement:
     * Only the trainer assigned to this
     * session can clear the whiteboard.
     */
    if (
      !isSessionTrainer(
        session,
        req.user.userId
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the assigned trainer can clear the whiteboard",
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
    });
  }
};