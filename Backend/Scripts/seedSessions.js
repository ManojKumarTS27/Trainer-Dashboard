import mongoose from "mongoose";
import dotenv from "dotenv";
import process from "node:process";

import User from "../Models/User.js";
import Session from "../Models/Session.js";

dotenv.config();

const STUDENT_EMAIL = "vinoth@gmail.com";

const SESSION_NAME =
  "Virtual Classroom Chat Demo Session";

const seedSessions = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing from .env"
      );
    }

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected successfully"
    );

    /*
    Find an active Teacher.
    */
    const teacher = await User.findOne({
      role: "Teacher",
      isActive: true,
    });

    if (!teacher) {
      throw new Error(
        "No active Teacher found. Create or seed a Teacher user first."
      );
    }

    /*
    Find Vinoth specifically.
    */
    const student = await User.findOne({
      email: STUDENT_EMAIL,
      role: "Student",
      isActive: true,
    });

    if (!student) {
      throw new Error(
        `Active Student with email ${STUDENT_EMAIL} was not found`
      );
    }

    /*
    Check whether the demo session already exists.
    */
    let session = await Session.findOne({
      sessionName: SESSION_NAME,
    });

    if (session) {
      /*
      Update the Teacher if necessary.
      */
      session.trainerId = teacher._id;

      /*
      Add Vinoth without creating duplicates.
      */
      const studentAlreadyAdded =
        session.participants.some(
          (participantId) =>
            participantId.toString() ===
            student._id.toString()
        );

      if (!studentAlreadyAdded) {
        session.participants.push(
          student._id
        );
      }

      /*
      Ensure dates remain valid.
      */
      if (
        !session.startTime ||
        !session.endTime ||
        session.endTime <= session.startTime
      ) {
        session.startTime = new Date(
          Date.now() + 30 * 60 * 1000
        );

        session.endTime = new Date(
          session.startTime.getTime() +
            60 * 60 * 1000
        );
      }

      if (
        session.status === "Cancelled"
      ) {
        session.status = "Upcoming";
      }

      await session.save();

      console.log(
        "Existing session updated successfully"
      );
    } else {
      const startTime = new Date(
        Date.now() + 30 * 60 * 1000
      );

      const endTime = new Date(
        startTime.getTime() +
          60 * 60 * 1000
      );

      session = await Session.create({
        sessionName: SESSION_NAME,

        trainerId: teacher._id,

        participants: [
          student._id,
        ],

        startTime,

        endTime,

        status: "Upcoming",

        description:
          "Session created for testing chat APIs",
      });

      console.log(
        "New session created successfully"
      );
    }

    console.log({
      sessionId:
        session._id.toString(),

      sessionName:
        session.sessionName,

      trainer: {
        id: teacher._id.toString(),
        name: teacher.name,
        email: teacher.email,
      },

      student: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
      },

      participants:
        session.participants.map(
          (participantId) =>
            participantId.toString()
        ),

      status: session.status,

      startTime:
        session.startTime,

      endTime:
        session.endTime,
    });
  } catch (error) {
    console.error(
      "Session seed error:",
      error.message
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();

    console.log(
      "MongoDB disconnected"
    );
  }
};

seedSessions();