import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sessionName: {
      type: String,
      required: [true, "Session name is required"],
      trim: true,
      minlength: [2, "Session name must contain at least 2 characters"],
      maxlength: [100, "Session name cannot exceed 100 characters"],
    },

    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Trainer ID is required"],
    },

    startTime: {
      type: Date,
      required: [true, "Session start time is required"],
    },

    endTime: {
      type: Date,
      required: [true, "Session end time is required"],
    },

    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.pre("validate", function (next) {
  if (
    this.startTime &&
    this.endTime &&
    this.endTime <= this.startTime
  ) {
    return next(
      new Error("Session end time must be later than start time")
    );
  }

  next();
});

const Session = mongoose.model("Session", sessionSchema);

export default Session;