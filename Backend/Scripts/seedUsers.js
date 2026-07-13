import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import process from "node:process";

import User from "../Models/User.js";

dotenv.config();

const testUsers = [
  {
    name: "Student User",
    email: "student@test.com",
    password: "Password@123",
    role: "Student",
  },
  {
    name: "Teacher User",
    email: "teacher@test.com",
    password: "Password@123",
    role: "Teacher",
  },
  {
    name: "Employer User",
    email: "employer@test.com",
    password: "Password@123",
    role: "Employer",
  },
  {
    name: "Employee User",
    email: "employee@test.com",
    password: "Password@123",
    role: "Employee",
  },
  {
    name: "Admin User",
    email: "admin@test.com",
    password: "Password@123",
    role: "Admin",
  },
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const testUser of testUsers) {
      const hashedPassword = await bcrypt.hash(
        testUser.password,
        12
      );

      await User.findOneAndUpdate(
        { email: testUser.email },
        {
          name: testUser.name,
          email: testUser.email,
          password: hashedPassword,
          role: testUser.role,
          isActive: true,
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

      console.log(
        `${testUser.role} user created: ${testUser.email}`
      );
    }

    console.log("All RBAC test users created successfully");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

seedUsers();