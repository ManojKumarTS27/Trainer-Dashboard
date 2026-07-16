import mongoose from "mongoose";

const whiteboardSchema =
  new mongoose.Schema(
    {
      sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        required: [
          true,
          "Session ID is required",
        ],
        index: true,
      },

      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [
          true,
          "User ID is required",
        ],
      },

      drawingData: {
        type: mongoose.Schema.Types.Mixed,
        required: [
          true,
          "Drawing data is required",
        ],
      },

      toolType: {
        type: String,
        required: [
          true,
          "Tool type is required",
        ],
        enum: {
          values: [
            "Pen",
            "Eraser",
            "Shape",
            "Text",
          ],
          message:
            "Tool type must be Pen, Eraser, Shape or Text",
        },
      },

      color: {
        type: String,
        default: "#111827",
        trim: true,
      },

      strokeWidth: {
        type: Number,
        default: 3,
        min: [
          1,
          "Stroke width must be at least 1",
        ],
        max: [
          50,
          "Stroke width cannot exceed 50",
        ],
      },

      timestamp: {
        type: Date,
        default: Date.now,
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

whiteboardSchema.index({
  sessionId: 1,
  timestamp: 1,
});

const Whiteboard = mongoose.model(
  "Whiteboard",
  whiteboardSchema
);

export default Whiteboard;