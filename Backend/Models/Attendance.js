import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: [true, "Session ID is required"],
      index: true,
    },

    joinTime: {
      type: Date,
      required: [true, "Join time is required"],
      default: Date.now,
    },

    leaveTime: {
      type: Date,
      default: null,
    },

    duration: {
      type: Number,
      default: 0,
      min: [0, "Duration cannot be negative"],
    },

    status: {
      type: String,
      enum: ["Present", "Late", "Absent", "Excused"],
      default: "Present",
      required: true,
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Marked-by user ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  {
    userId: 1,
    sessionId: 1,
  },
  {
    unique: true,
    name: "unique_user_session_attendance",
  }
);

const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema
);

export default Attendance;