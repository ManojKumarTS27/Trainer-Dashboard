import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import process from "node:process";

import connectDB from "./Config/db.js";

import attendanceRoutes from "./Routes/attendanceRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import chatRoutes from "./Routes/chatRoutes.js";
import protectedRoutes from "./Routes/protectedRoutes.js";
import whiteboardRoutes from "./Routes/whiteboardRoutes.js";

import Session from "./Models/Session.js";

dotenv.config();

const app = express();

const PORT =
  process.env.PORT || 5000;

/* Middleware */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(
  express.json({
    limit: "5mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "5mb",
  })
);

/* Health check */

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      "RBAC and Virtual Classroom backend is running",
  });
});

/* API routes */

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/protected",
  protectedRoutes
);

app.use(
  "/api/attendance",
  attendanceRoutes
);

app.use(
  "/api/chat",
  chatRoutes
);

app.use(
  "/api/whiteboard",
  whiteboardRoutes
);

/* Temporary session testing routes */

app.get(
  "/api/test/sessions",
  async (req, res) => {
    try {
      const sessions =
        await Session.find()
          .populate(
            "trainerId",
            "name email role isActive"
          )
          .populate(
            "participants",
            "name email role isActive"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        message:
          sessions.length > 0
            ? "Sessions retrieved successfully"
            : "No sessions found",
        connectedDatabase:
          Session.db.name,
        count:
          sessions.length,
        sessions,
      });
    } catch (error) {
      console.error(
        "Get test sessions error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to retrieve sessions",
        error: error.message,
      });
    }
  }
);

app.get(
  "/api/test/sessions/:sessionId",
  async (req, res) => {
    try {
      const { sessionId } =
        req.params;

      const session =
        await Session.findById(
          sessionId
        )
          .populate(
            "trainerId",
            "name email role isActive"
          )
          .populate(
            "participants",
            "name email role isActive"
          );

      if (!session) {
        return res.status(404).json({
          success: false,
          message:
            "Session not found",
          receivedSessionId:
            sessionId,
          connectedDatabase:
            Session.db.name,
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Session retrieved successfully",
        session,
      });
    } catch (error) {
      console.error(
        "Get single test session error:",
        error
      );

      if (
        error.name ===
        "CastError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid session ID",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Unable to retrieve session",
        error: error.message,
      });
    }
  }
);

/* 404 handler */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message:
      "API route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

/* Global error handler */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Unhandled server error:",
      error
    );

    if (res.headersSent) {
      return next(error);
    }

    if (
      error.type ===
      "entity.too.large"
    ) {
      return res.status(413).json({
        success: false,
        message:
          "Request payload is too large",
      });
    }

    if (
      error instanceof
      SyntaxError
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid JSON request body",
      });
    }

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Validation failed",
        errors:
          Object.values(
            error.errors
          ).map(
            (
              validationError
            ) =>
              validationError.message
          ),
      });
    }

    if (
      error.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Invalid ${error.path}`,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
);

/* Start server */

const startServer = async () => {
  try {
    await connectDB();

    app.listen(
      PORT,
      () => {
        console.log(
          `Server running at http://localhost:${PORT}`
        );

        console.log(
          `Connected database: ${Session.db.name}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Unable to start server:",
      error.message
    );

    process.exit(1);
  }
};

startServer();