import mongoose from "mongoose";
import dotenv from "dotenv";
import process from "node:process";
import User from "../Models/User.js";
import Session from "../Models/Session.js";

dotenv.config();

const seedSessions = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB connected");

    const teacher = await User.findOne({
      role: "Teacher",
      isActive: true,
    });

    if (!teacher) {
      console.log(
        "No active Teacher found. Run seedUsers.js first."
      );

      process.exitCode = 1;
      return;
    }

    const existingSession =
      await Session.findOne({
        sessionName:
          "Attendance Management Demo Session",
      });

    if (existingSession) {
      console.log(
        "Demo session already exists:"
      );

      console.log({
        sessionId: existingSession._id,
        sessionName:
          existingSession.sessionName,
      });

      return;
    }

    const startTime = new Date();

    startTime.setMinutes(
      startTime.getMinutes() + 30
    );

    const endTime = new Date(
      startTime.getTime() + 60 * 60 * 1000
    );

    const session = await Session.create({
      sessionName:
        "Attendance Management Demo Session",

      trainerId: teacher._id,

      startTime,

      endTime,

      status: "Upcoming",

      description:
        "Session created for testing attendance APIs",
    });

    console.log(
      "Demo session created successfully"
    );

    console.log({
      sessionId: session._id,
      sessionName: session.sessionName,
      trainerId: session.trainerId,
      startTime: session.startTime,
      endTime: session.endTime,
    });
  } catch (error) {
    console.error(
      "Session seeding failed:",
      error.message
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();

    console.log("MongoDB disconnected");
  }
};

seedSessions();