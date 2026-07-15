import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Whiteboard from "./Whiteboard";
import ClassroomChat from "./ClassroomChat";

import "./DigitalClassroom.css";

function getStoredSession(sessionId) {
  try {
    const sessions = JSON.parse(
      localStorage.getItem("sessions") || "[]"
    );

    if (!Array.isArray(sessions)) {
      return null;
    }

    return sessions.find(
      (session) =>
        String(session.id) ===
        String(sessionId)
    );
  } catch (error) {
    console.error(
      "Unable to find session:",
      error
    );

    return null;
  }
}

function DigitalClassroom() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const session =
    getStoredSession(sessionId);

  const returnToDashboard = () => {
    navigate("/trainer-dashboard");
  };

  const endSession = () => {
    try {
      const sessions = JSON.parse(
        localStorage.getItem("sessions") || "[]"
      );

      const updatedSessions = sessions.map(
        (currentSession) =>
          String(currentSession.id) ===
          String(sessionId)
            ? {
                ...currentSession,
                status: "Completed",
              }
            : currentSession
      );

      localStorage.setItem(
        "sessions",
        JSON.stringify(updatedSessions)
      );

      localStorage.removeItem(
        "activeSession"
      );

      navigate("/trainer-dashboard");
    } catch (error) {
      console.error(
        "Unable to end session:",
        error
      );
    }
  };

  if (!session) {
    return (
      <div className="classroom-error-page">
        <div className="classroom-error-card">
          <h2>Session Not Found</h2>

          <p>
            Create a session from the dashboard and
            click Start Session.
          </p>

          <button
            type="button"
            onClick={returnToDashboard}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="digital-classroom">
      <header className="classroom-topbar">
        <div>
          <div className="live-indicator">
            <span />
            Live Classroom
          </div>

          <h1>
            {session.sessionName ||
              session.batch}
          </h1>

          <p>
            {session.trainerName ||
              "Trainer"}
            {" • "}
            {session.duration ||
              "60 minutes"}
          </p>
        </div>

        <div className="classroom-header-actions">
          <button
            type="button"
            className="dashboard-back-btn"
            onClick={returnToDashboard}
          >
            Dashboard
          </button>

          <button
            type="button"
            className="end-session-btn"
            onClick={endSession}
          >
            End Session
          </button>
        </div>
      </header>

      <main className="classroom-content">
        <section className="whiteboard-section">
          <Whiteboard
            sessionId={sessionId}
          />
        </section>

        <aside className="chat-section">
          <ClassroomChat
            sessionId={sessionId}
          />
        </aside>
      </main>
    </div>
  );
}

export default DigitalClassroom;