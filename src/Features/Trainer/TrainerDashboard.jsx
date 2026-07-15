import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import CreateSessionModal from "./CreateSessionModal";
import "./TrainerDashboard.css";

function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("authUser") || "null"
    );
  } catch (error) {
    console.error(
      "Unable to read authenticated user:",
      error
    );

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
    console.error(
      "Unable to read sessions:",
      error
    );

    return [];
  }
}

function TrainerDashboard() {
  const navigate = useNavigate();

  const [user] = useState(getStoredUser);

  const [sessions, setSessions] = useState(
    getStoredSessions
  );

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !user) {
      localStorage.removeItem("token");
      localStorage.removeItem("authUser");

      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate, user]);

  const saveSessions = (updatedSessions) => {
    setSessions(updatedSessions);

    localStorage.setItem(
      "sessions",
      JSON.stringify(updatedSessions)
    );
  };

  const handleCreateSession = (
    sessionData
  ) => {
    const newSession = {
      id: `SES-${Date.now()}`,

      sessionName:
        sessionData.sessionName.trim(),

      batch: sessionData.batch,

      trainerName:
        sessionData.trainerName.trim() ||
        user?.name ||
        "Trainer",

      date: sessionData.date,

      time: sessionData.time,

      duration:
        sessionData.duration ||
        "60 minutes",

      status:
        sessionData.status ||
        "Upcoming",

      description:
        sessionData.description.trim(),

      createdAt: new Date().toISOString(),
    };

    saveSessions([
      newSession,
      ...sessions,
    ]);

    setShowCreateModal(false);
  };

  const startSession = (session) => {
    const liveSession = {
      ...session,
      status: "Live",
    };

    const updatedSessions = sessions.map(
      (currentSession) =>
        currentSession.id === session.id
          ? liveSession
          : currentSession
    );

    saveSessions(updatedSessions);

    localStorage.setItem(
      "activeSession",
      JSON.stringify(liveSession)
    );

    navigate(
      `/digital-classroom/${session.id}`
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("activeSession");

    navigate("/login", {
      replace: true,
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
        <div className="dashboard-user">
          <div className="user-avatar">
            {(user.name || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <p className="dashboard-label">
              Digital learning workspace
            </p>

            <h1>
              Welcome, {user.name || "User"}
            </h1>

            <p className="dashboard-role">
              Signed in as{" "}
              <strong>{user.role}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <section className="dashboard-summary">
        <div>
          <span>Total Sessions</span>
          <strong>{sessions.length}</strong>
        </div>

        <div>
          <span>Upcoming</span>

          <strong>
            {
              sessions.filter(
                (session) =>
                  session.status === "Upcoming"
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Live Sessions</span>

          <strong>
            {
              sessions.filter(
                (session) =>
                  session.status === "Live"
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Completed</span>

          <strong>
            {
              sessions.filter(
                (session) =>
                  session.status === "Completed"
              ).length
            }
          </strong>
        </div>
      </section>

      <main className="dashboard-grid">
        {isTeacherOrAdmin && (
          <article className="dashboard-card">
            <div className="dashboard-card-icon">
              ＋
            </div>

            <h2>Create Session</h2>

            <p>
              Schedule and prepare a new digital
              classroom session.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowCreateModal(true)
              }
            >
              Create Session
            </button>
          </article>
        )}

        {isTeacherOrAdmin && (
          <article className="dashboard-card">
            <div className="dashboard-card-icon">
              📅
            </div>

            <h2>Session Management</h2>

            <p>
              View, update and manage all classroom
              sessions.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/session-management"
                )
              }
            >
              Manage Sessions
            </button>
          </article>
        )}

        <article className="dashboard-card">
          <div className="dashboard-card-icon">
            ✓
          </div>

          <h2>Attendance</h2>

          <p>
            Monitor attendance, participation and
            session duration.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/attendance")
            }
          >
            View Attendance
          </button>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-icon">
            🎥
          </div>

          <h2>Recording Dashboard</h2>

          <p>
            Upload and manage digital classroom
            recordings.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/recording-dashboard"
              )
            }
          >
            Open Recordings
          </button>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-icon">
            ▶
          </div>

          <h2>Session Recordings</h2>

          <p>
            Watch previously uploaded classroom
            recordings.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/session-recordings"
              )
            }
          >
            Watch Recordings
          </button>
        </article>

        <section className="dashboard-card sessions-section">
          <div className="recent-sessions-header">
            <div>
              <h2>Recent Sessions</h2>

              <p>
                Start or manage your latest
                classroom sessions.
              </p>
            </div>

            {isTeacherOrAdmin && (
              <button
                type="button"
                className="view-all-sessions-btn"
                onClick={() =>
                  navigate(
                    "/session-management"
                  )
                }
              >
                View All
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="empty-box">
              <div className="empty-box-icon">
                📅
              </div>

              <h3>
                No sessions created yet
              </h3>

              <p>
                Create your first virtual classroom
                session.
              </p>

              {isTeacherOrAdmin && (
                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(true)
                  }
                >
                  Create Session
                </button>
              )}
            </div>
          ) : (
            <div className="session-table-wrapper">
              <table className="session-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Trainer</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {sessions
                    .slice(0, 10)
                    .map((session) => (
                      <tr key={session.id}>
                        <td>
                          <div className="session-title-cell">
                            <strong>
                              {session.sessionName ||
                                session.batch}
                            </strong>

                            <small>
                              {session.id}
                            </small>
                          </div>
                        </td>

                        <td>
                          {session.trainerName ||
                            "Trainer"}
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
                            "60 minutes"}
                        </td>

                        <td>
                          <span
                            className={`session-status session-status--${String(
                              session.status ||
                                "Upcoming"
                            ).toLowerCase()}`}
                          >
                            {session.status ||
                              "Upcoming"}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="start-session-btn"
                            onClick={() =>
                              startSession(session)
                            }
                          >
                            {session.status ===
                            "Live"
                              ? "Rejoin"
                              : "Start Session"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {showCreateModal && (
        <CreateSessionModal
          defaultTrainerName={
            user.name || ""
          }
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