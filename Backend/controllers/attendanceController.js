import Attendance from "../Models/Attendance.js";
import Session from "../Models/Session.js";
import User from "../Models/User.js";

const ATTENDED_STATUSES = ["Present", "Late"];

const calculateDurationInMinutes = (
  joinTime,
  leaveTime
) => {
  if (!joinTime || !leaveTime) {
    return 0;
  }

  const joinDate = new Date(joinTime);
  const leaveDate = new Date(leaveTime);

  if (
    Number.isNaN(joinDate.getTime()) ||
    Number.isNaN(leaveDate.getTime())
  ) {
    throw new Error("Invalid join time or leave time");
  }

  if (leaveDate < joinDate) {
    throw new Error(
      "Leave time cannot be earlier than join time"
    );
  }

  const differenceInMilliseconds =
    leaveDate.getTime() - joinDate.getTime();

  const differenceInMinutes =
    differenceInMilliseconds / (1000 * 60);

  return Number(differenceInMinutes.toFixed(2));
};

const populateAttendance = (query) => {
  return query
    .populate("userId", "name email role isActive")
    .populate(
      "sessionId",
      "sessionName trainerId startTime endTime status description"
    )
    .populate("markedBy", "name email role");
};

/*
  POST /api/attendance/mark

  Student:
  - Can mark only their own attendance.

  Teacher/Admin:
  - Can mark their own attendance.
  - Can mark another user's attendance by passing userId.
*/
export const markAttendance = async (req, res) => {
  try {
    const authenticatedUserId = req.user.userId;

    const {
      userId,
      sessionId,
      joinTime,
      leaveTime,
      status,
    } = req.body;

    let attendanceUserId = authenticatedUserId;

    if (
      ["Teacher", "Admin"].includes(req.user.role) &&
      userId
    ) {
      attendanceUserId = userId;
    }

    if (
      req.user.role === "Student" &&
      userId &&
      userId.toString() !==
        authenticatedUserId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Students can mark attendance only for themselves",
      });
    }

    const attendanceUser = await User.findById(
      attendanceUserId
    ).select("_id name email role isActive");

    if (!attendanceUser) {
      return res.status(404).json({
        success: false,
        message: "Attendance user not found",
      });
    }

    if (!attendanceUser.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Attendance cannot be marked for a disabled user",
      });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "Attendance cannot be marked for a cancelled session",
      });
    }

    const duplicateAttendance =
      await Attendance.findOne({
        userId: attendanceUserId,
        sessionId,
      });

    if (duplicateAttendance) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance has already been marked for this user and session",
        attendanceId: duplicateAttendance._id,
      });
    }

    const finalJoinTime = joinTime
      ? new Date(joinTime)
      : new Date();

    const finalLeaveTime = leaveTime
      ? new Date(leaveTime)
      : null;

    const duration = finalLeaveTime
      ? calculateDurationInMinutes(
          finalJoinTime,
          finalLeaveTime
        )
      : 0;

    const attendance = await Attendance.create({
      userId: attendanceUserId,
      sessionId,
      joinTime: finalJoinTime,
      leaveTime: finalLeaveTime,
      duration,
      status: status || "Present",
      markedBy: authenticatedUserId,
    });

    const populatedAttendance =
      await populateAttendance(
        Attendance.findById(attendance._id)
      );

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      attendance: populatedAttendance,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance has already been marked for this user and session",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Invalid ${error.path}`,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Attendance validation failed",
        errors: Object.values(error.errors).map(
          (item) => item.message
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to mark attendance",
    });
  }
};

/*
  GET /api/attendance/session/:sessionId

  Allowed roles:
  - Teacher
  - Admin
*/
export const getAttendanceBySession = async (
  req,
  res
) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(
      sessionId
    ).populate("trainerId", "name email role");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const attendanceRecords =
      await populateAttendance(
        Attendance.find({
          sessionId,
        }).sort({
          joinTime: 1,
        })
      );

    const summary = {
      totalRecords: attendanceRecords.length,

      present: attendanceRecords.filter(
        (record) => record.status === "Present"
      ).length,

      late: attendanceRecords.filter(
        (record) => record.status === "Late"
      ).length,

      absent: attendanceRecords.filter(
        (record) => record.status === "Absent"
      ).length,

      excused: attendanceRecords.filter(
        (record) => record.status === "Excused"
      ).length,

      totalDurationMinutes: Number(
        attendanceRecords
          .reduce(
            (total, record) =>
              total + (record.duration || 0),
            0
          )
          .toFixed(2)
      ),
    };

    return res.status(200).json({
      success: true,
      session,
      summary,
      attendance: attendanceRecords,
    });
  } catch (error) {
    console.error(
      "Get attendance by session error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve session attendance",
    });
  }
};

/*
  GET /api/attendance/student/:studentId

  Student:
  - Can view only their own records.

  Teacher/Admin:
  - Can view any student's records.
*/
export const getAttendanceByStudent = async (
  req,
  res
) => {
  try {
    const { studentId } = req.params;

    const authenticatedUserId =
      req.user.userId.toString();

    if (
      req.user.role === "Student" &&
      studentId !== authenticatedUserId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Students can view only their own attendance",
      });
    }

    const student = await User.findById(
      studentId
    ).select("name email role isActive");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.role !== "Student") {
      return res.status(400).json({
        success: false,
        message:
          "The supplied user ID does not belong to a Student",
      });
    }

    const attendanceRecords =
      await populateAttendance(
        Attendance.find({
          userId: studentId,
        }).sort({
          createdAt: -1,
        })
      );

    const attendedSessions =
      attendanceRecords.filter((record) =>
        ATTENDED_STATUSES.includes(record.status)
      ).length;

    const totalSessions =
      attendanceRecords.length;

    const attendancePercentage =
      totalSessions === 0
        ? 0
        : Number(
            (
              (attendedSessions / totalSessions) *
              100
            ).toFixed(2)
          );

    const totalDurationMinutes = Number(
      attendanceRecords
        .reduce(
          (total, record) =>
            total + (record.duration || 0),
          0
        )
        .toFixed(2)
    );

    return res.status(200).json({
      success: true,
      student,
      summary: {
        totalSessions,
        attendedSessions,
        attendancePercentage,
        totalDurationMinutes,
      },
      attendance: attendanceRecords,
    });
  } catch (error) {
    console.error(
      "Get attendance by student error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve student attendance",
    });
  }
};

/*
  PUT /api/attendance/update

  The record can be selected using:
  - attendanceId

  Or:
  - userId and sessionId

  A Student may supply only sessionId because their
  authenticated user ID is used automatically.
*/
export const updateAttendance = async (req, res) => {
  try {
    const authenticatedUserId =
      req.user.userId;

    const {
      attendanceId,
      userId,
      sessionId,
      joinTime,
      leaveTime,
      status,
    } = req.body;

    let attendance;

    if (attendanceId) {
      attendance = await Attendance.findById(
        attendanceId
      );
    } else {
      const targetUserId =
        req.user.role === "Student"
          ? authenticatedUserId
          : userId;

      if (!targetUserId || !sessionId) {
        return res.status(400).json({
          success: false,
          message:
            "Provide attendanceId or both userId and sessionId",
        });
      }

      attendance = await Attendance.findOne({
        userId: targetUserId,
        sessionId,
      });
    }

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    if (
      req.user.role === "Student" &&
      attendance.userId.toString() !==
        authenticatedUserId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Students can update only their own attendance",
      });
    }

    /*
      Students can register their leave time.
      They cannot modify join time or status.
    */
    if (
      req.user.role === "Student" &&
      (joinTime !== undefined ||
        status !== undefined)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Students can update only their leave time",
      });
    }

    if (joinTime !== undefined) {
      attendance.joinTime = new Date(joinTime);
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "leaveTime"
      )
    ) {
      attendance.leaveTime = leaveTime
        ? new Date(leaveTime)
        : null;
    }

    if (status !== undefined) {
      attendance.status = status;
    }

    attendance.duration = attendance.leaveTime
      ? calculateDurationInMinutes(
          attendance.joinTime,
          attendance.leaveTime
        )
      : 0;

    await attendance.save();

    const updatedAttendance =
      await populateAttendance(
        Attendance.findById(attendance._id)
      );

    return res.status(200).json({
      success: true,
      message:
        "Attendance updated successfully",
      attendance: updatedAttendance,
    });
  } catch (error) {
    console.error(
      "Update attendance error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Invalid ${error.path}`,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Attendance validation failed",
        errors: Object.values(error.errors).map(
          (item) => item.message
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to update attendance",
    });
  }
};