import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateSessionModal from "./CreateSessionModal";
import "./TrainerDashboard.css";

const dashboardRoutes = {
  Student: "/student-dashboard",
  Teacher: "/teacher-dashboard",
  Employer: "/employer-dashboard",
  Employee: "/employee-dashboard",
  Admin: "/admin-dashboard",
};

function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("authUser") || "null"
    );
  } catch (error) {
    console.error("Unable to read authenticated user:", error);
    return null;
  }
}

function getStoredSessions() {
  try {
    const storedSessions = JSON.parse(
      localStorage.getItem("sessions") || "[]"
    );

    return Array.isArray(storedSessions)
      ? storedSessions
      : [];
  } catch (error) {
    console.error("Unable to read sessions:", error);
    return [];
  }
}

function TrainerDashboard() {
  const navigate = useNavigate();

  const [user] = useState(getStoredUser);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [sessions, setSessions] = useState(
    getStoredSessions
  );

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!user || !token) {
      localStorage.removeItem("token");
      localStorage.removeItem("authUser");
      localStorage.removeItem("isLoggedIn");

      navigate("/login", { replace: true });
      return;
    }

    if (!dashboardRoutes[user.role]) {
      navigate("/access-denied", {
        replace: true,
      });
    }
  }, [navigate, user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    localStorage.removeItem("isLoggedIn");

    navigate("/login", { replace: true });
  };

  const handleCreateSession = (newSession) => {
    const normalizedSession = {
      id: newSession.id || `SES-${Date.now()}`,

      sessionName:
        newSession.sessionName ||
        newSession.batch ||
        "Untitled Session",

      batch:
        newSession.batch ||
        newSession.sessionName ||
        "Not provided",

      trainerName:
        newSession.trainerName ||
        user?.name ||
        "Not provided",

      date: newSession.date || "",

      time: newSession.time || "",

      duration:
        newSession.duration || "Not provided",

      status:
        newSession.status || "Upcoming",

      ...newSession,
    };

    setSessions((previousSessions) => {
      const updatedSessions = [
        normalizedSession,
        ...previousSessions,
      ];

      localStorage.setItem(
        "sessions",
        JSON.stringify(updatedSessions)
      );

      return updatedSessions;
    });
  };

  if (!user) {
    return null;
  }

  const isTeacherOrAdmin =
    user.role === "Teacher" ||
    user.role === "Admin";

  return (
    <div className="trainer-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>
            Welcome, {user.name || "User"}
          </h1>

          <p>
            Role: <strong>{user.role}</strong>
          </p>
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <div className="dashboard-grid">
        {isTeacherOrAdmin && (
          <div className="dashboard-card">
            <h2>Create Session</h2>

            <p>
              Schedule a new virtual classroom.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowCreateModal(true)
              }
            >
              Open
            </button>
          </div>
        )}

        {isTeacherOrAdmin && (
          <div className="dashboard-card">
            <h2>Session Management</h2>

            <p>
              Create, view and manage training
              sessions.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/session-management")
              }
            >
              Open
            </button>
          </div>
        )}

        <div className="dashboard-card">
          <h2>Recording Dashboard</h2>

          <p>
            View and manage uploaded recordings.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/recording-dashboard")
            }
          >
            Open
          </button>
        </div>

        <div className="dashboard-card">
          <h2>Session Recordings</h2>

          <p>
            Watch previously uploaded session
            recordings.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/session-recordings")
            }
          >
            Open
          </button>
        </div>

        <div className="dashboard-card full-width">
          <h2>Recent Sessions</h2>

          {sessions.length === 0 ? (
            <div className="empty-box">
              <h3>No sessions created yet</h3>

              <p>
                Teacher or Admin users can create
                a new session.
              </p>
            </div>
          ) : (
            <div className="session-table-wrapper">
              <table className="session-table">
                <thead>
                  <tr>
                    <th>Session ID</th>
                    <th>Session</th>
                    <th>Trainer</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {sessions
                    .slice(0, 10)
                    .map((session) => (
                      <tr key={session.id}>
                        <td>{session.id}</td>

                        <td>
                          {session.sessionName ||
                            session.batch ||
                            "Untitled Session"}
                        </td>

                        <td>
                          {session.trainerName ||
                            "Not provided"}
                        </td>

                        <td>
                          {session.date ||
                            "Not provided"}
                        </td>

                        <td>
                          {session.time ||
                            "Not provided"}
                        </td>

                        <td>
                          {session.duration ||
                            "Not provided"}
                        </td>

                        <td>
                          {session.status ||
                            "Upcoming"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateSessionModal
          onClose={() =>
            setShowCreateModal(false)
          }
          onCreateSession={
            handleCreateSession
          }
        />
      )}
    </div>
  );
}

export default TrainerDashboard;
