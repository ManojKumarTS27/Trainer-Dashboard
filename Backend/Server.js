import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import process from "node:process";

import connectDB from "./Config/db.js";
import authRoutes from "./Routes/authRoutes.js";
import protectedRoutes from "./Routes/protectedRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

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
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RBAC backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(
      `Server running at http://localhost:${PORT}`
    );
  });
};

startServer();