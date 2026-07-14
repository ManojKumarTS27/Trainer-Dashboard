import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import AttendanceCard from "./Components/AttendanceCard";
import AttendanceFilters from "./Components/AttendanceFilters";
import AttendanceTable from "./Components/AttendanceTable";
import AttendanceDetailsModal from "./Components/AttendanceDetailsModal";
import { fetchAllAttendance } from "./attendanceApi";

import "./AttendancePage.css";

const initialFilters = {
  search: "",
  session: "",
  status: "",
  date: "",
};

function getId(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value._id || value.id || "";
}

function getName(value, fallback) {
  if (!value) {
    return fallback;
  }

  if (typeof value === "string") {
    return value;
  }

  return (
    value.name ||
    value.sessionName ||
    value.title ||
    fallback
  );
}

function getEmail(value) {
  if (
    value &&
    typeof value === "object" &&
    value.email
  ) {
    return value.email;
  }

  return "";
}

function calculateDurationMinutes(
  duration,
  joinTime,
  leaveTime
) {
  const storedDuration = Number(duration);

  if (
    Number.isFinite(storedDuration) &&
    storedDuration >= 0
  ) {
    return storedDuration;
  }

  if (!joinTime || !leaveTime) {
    return 0;
  }

  const joinDate = new Date(joinTime);
  const leaveDate = new Date(leaveTime);

  if (
    Number.isNaN(joinDate.getTime()) ||
    Number.isNaN(leaveDate.getTime())
  ) {
    return 0;
  }

  const difference =
    leaveDate.getTime() - joinDate.getTime();

  return Math.max(
    0,
    Math.round(difference / 60000)
  );
}

function formatDuration(durationMinutes) {
  const totalMinutes = Math.max(
    0,
    Number(durationMinutes) || 0
  );

  if (totalMinutes === 0) {
    return "0 min";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}

function normalizeStatus(status) {
  const statusValue = String(
    status || ""
  ).toLowerCase();

  if (statusValue === "present") {
    return "Present";
  }

  if (statusValue === "late") {
    return "Late";
  }

  if (statusValue === "absent") {
    return "Absent";
  }

  return "Absent";
}

function normalizeAttendanceRecord(record, index) {
  const studentSource =
    record.userId ||
    record.studentId ||
    record.student;

  const sessionSource =
    record.sessionId || record.session;

  const durationMinutes =
    calculateDurationMinutes(
      record.duration,
      record.joinTime,
      record.leaveTime
    );

  return {
    id:
      record._id ||
      record.id ||
      `attendance-${index}`,

    studentId: getId(studentSource),

    studentName:
      getName(studentSource, "") ||
      record.studentName ||
      record.userName ||
      "Unknown Student",

    studentEmail:
      getEmail(studentSource) ||
      record.studentEmail ||
      "",

    sessionId: getId(sessionSource),

    sessionName:
      getName(sessionSource, "") ||
      record.sessionName ||
      "Unknown Session",

    joinTime: record.joinTime || null,
    leaveTime: record.leaveTime || null,
    duration: durationMinutes,
    formattedDuration:
      formatDuration(durationMinutes),

    status: normalizeStatus(record.status),

    createdAt:
      record.createdAt ||
      record.joinTime ||
      null,
  };
}

function extractRecords(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  const possibleCollections = [
    responseData.attendance,
    responseData.attendanceRecords,
    responseData.records,
    responseData.data,
  ];

  for (const collection of possibleCollections) {
    if (Array.isArray(collection)) {
      return collection;
    }

    if (
      collection &&
      Array.isArray(collection.attendance)
    ) {
      return collection.attendance;
    }

    if (
      collection &&
      Array.isArray(collection.records)
    ) {
      return collection.records;
    }
  }

  return [];
}

function AttendancePage() {
  const navigate = useNavigate();

  const [attendanceRecords, setAttendanceRecords] =
    useState([]);

  const [filters, setFilters] =
    useState(initialFilters);

  const [
    selectedAttendance,
    setSelectedAttendance,
  ] = useState(null);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const responseData =
        await fetchAllAttendance();

      const records = extractRecords(
        responseData
      ).map(normalizeAttendanceRecord);

      setAttendanceRecords(records);
    } catch (error) {
      console.error(
        "Unable to fetch attendance:",
        error
      );

      if (
        error.message
          .toLowerCase()
          .includes("authentication")
      ) {
        setErrorMessage(
          "Your login session has expired. Please log in again."
        );
      } else {
        setErrorMessage(
          error.message ||
            "Unable to load attendance records. Please try again."
        );
      }

      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const sessions = useMemo(() => {
    const sessionMap = new Map();

    attendanceRecords.forEach((record) => {
      const key =
        record.sessionId || record.sessionName;

      if (!sessionMap.has(key)) {
        sessionMap.set(key, {
          id: key,
          name: record.sessionName,
        });
      }
    });

    return Array.from(sessionMap.values()).sort(
      (firstSession, secondSession) =>
        firstSession.name.localeCompare(
          secondSession.name
        )
    );
  }, [attendanceRecords]);

  const filteredAttendance = useMemo(() => {
    const normalizedSearch =
      filters.search.trim().toLowerCase();

    return attendanceRecords.filter((record) => {
      const studentMatches =
        !normalizedSearch ||
        record.studentName
          .toLowerCase()
          .includes(normalizedSearch);

      const sessionMatches =
        !filters.session ||
        record.sessionId === filters.session ||
        record.sessionName === filters.session;

      const statusMatches =
        !filters.status ||
        record.status === filters.status;

      let dateMatches = true;

      if (filters.date) {
        const attendanceDate = new Date(
          record.joinTime || record.createdAt
        );

        if (
          Number.isNaN(attendanceDate.getTime())
        ) {
          dateMatches = false;
        } else {
          const year =
            attendanceDate.getFullYear();

          const month = String(
            attendanceDate.getMonth() + 1
          ).padStart(2, "0");

          const day = String(
            attendanceDate.getDate()
          ).padStart(2, "0");

          const localDate = `${year}-${month}-${day}`;

          dateMatches =
            localDate === filters.date;
        }
      }

      return (
        studentMatches &&
        sessionMatches &&
        statusMatches &&
        dateMatches
      );
    });
  }, [attendanceRecords, filters]);

  const statistics = useMemo(() => {
    const totalStudents =
      filteredAttendance.length;

    const present =
      filteredAttendance.filter(
        (record) =>
          record.status === "Present" ||
          record.status === "Late"
      ).length;

    const absent =
      filteredAttendance.filter(
        (record) => record.status === "Absent"
      ).length;

    const attendancePercentage =
      totalStudents > 0
        ? Math.round(
            (present / totalStudents) * 100
          )
        : 0;

    return {
      totalStudents,
      present,
      absent,
      attendancePercentage,
    };
  }, [filteredAttendance]);

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <main className="attendance-page">
      <div className="attendance-page__container">
        <header className="attendance-page__header">
          <div>
            <button
              type="button"
              className="attendance-back-button"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>

            <p className="attendance-page__eyebrow">
              Virtual Classroom
            </p>

            <h1>Attendance Management</h1>

            <p className="attendance-page__description">
              Monitor student participation, session
              duration, and attendance status.
            </p>
          </div>

          <button
            type="button"
            className="attendance-refresh-button"
            onClick={loadAttendance}
            disabled={loading}
          >
            <span
              className={
                loading
                  ? "attendance-refresh-icon attendance-refresh-icon--spinning"
                  : "attendance-refresh-icon"
              }
            >
              ↻
            </span>

            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {errorMessage && (
          <div
            className="attendance-error-message"
            role="alert"
          >
            <div>
              <strong>
                Unable to load attendance
              </strong>

              <p>{errorMessage}</p>
            </div>

            <button
              type="button"
              onClick={loadAttendance}
            >
              Try Again
            </button>
          </div>
        )}

        <AttendanceCard
          statistics={statistics}
        />

        <AttendanceFilters
          filters={filters}
          sessions={sessions}
          onFilterChange={setFilters}
          onClearFilters={clearFilters}
          resultCount={filteredAttendance.length}
        />

        <section className="attendance-table-section">
          {loading ? (
            <div className="attendance-loading-state">
              <div className="attendance-spinner" />

              <h3>Loading attendance records</h3>

              <p>
                Please wait while attendance data is
                being retrieved.
              </p>
            </div>
          ) : (
            <AttendanceTable
              attendanceRecords={
                filteredAttendance
              }
              onViewDetails={
                setSelectedAttendance
              }
            />
          )}
        </section>
      </div>

      <AttendanceDetailsModal
        attendance={selectedAttendance}
        onClose={() =>
          setSelectedAttendance(null)
        }
      />
    </main>
  );
}

export default AttendancePage;