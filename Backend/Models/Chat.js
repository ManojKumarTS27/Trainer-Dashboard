import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: [true, "Session ID is required"],
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
      index: true,
    },

    senderName: {
      type: String,
      required: [true, "Sender name is required"],
      trim: true,
      maxlength: [
        100,
        "Sender name cannot exceed 100 characters",
      ],
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [
        1000,
        "Message cannot exceed 1000 characters",
      ],
    },

    messageType: {
      type: String,
      enum: {
        values: ["Text", "File"],
        message: "Message type must be Text or File",
      },
      default: "Text",
      required: true,
    },

    fileUrl: {
      type: String,
      trim: true,
      default: null,
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


chatSchema.index({
  sessionId: 1,
  timestamp: 1,
});

const Chat = mongoose.model(
  "Chat",
  chatSchema
);

export default Chat;