import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateSessionModal from "./CreateSessionModal";
import "./TrainerDashboard.css";

function TrainerDashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const [sessions, setSessions] = useState([
    {
      id: "ROOM-123456",
      batch: "Batch A - React",
      date: "2026-07-06",
      time: "10:30",
      notified: false,
    },
  ]);

  const handleCreateSession = (newSession) => {
    setSessions((prevSessions) => [newSession, ...prevSessions]);
    setShowModal(false);
  };

  const handleNotify = (sessionId) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId ? { ...session, notified: true } : session
      )
    );

    alert("Students notified successfully!");
  };

  const handleStartSession = (sessionId) => {
    navigate(`/digital-classroom/${sessionId}`);
  };

  return (
    <div className="admin-dashboard">
      <main className="admin-main">
        <div className="welcome-card">
          <span>TRAINER DASHBOARD</span>
          <h1>Live Class Management</h1>
          <p>Create sessions, notify students, and start digital classrooms.</p>

          <div className="dashboard-actions">
            <button
              className="recording-btn"
              onClick={() => navigate("/recording-dashboard")}
            >
              🎥 Recording Dashboard
            </button>

            <button
              className="session-recordings-btn"
              onClick={() => navigate("/session-recordings")}
            >
              📹 Session Recordings
            </button>

            <button
              className="create-session-btn"
              onClick={() => setShowModal(true)}
            >
              + Create Live Session
            </button>
          </div>
        </div>

        <div className="dashboard-cards">
          {sessions.length === 0 ? (
            <div className="dash-card">
              <span>EMPTY</span>
              <h2>No Sessions</h2>
              <p>No sessions scheduled yet.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div className="dash-card" key={session.id}>
                <span>{session.id}</span>
                <h2>{session.batch}</h2>

                <p>
                  <strong>Date:</strong> {session.date}
                  <br />
                  <strong>Time:</strong> {session.time}
                </p>

                {session.notified ? (
                  <button className="notified-btn" disabled>
                    ✓ Students Notified
                  </button>
                ) : (
                  <button
                    className="notify-btn"
                    onClick={() => handleNotify(session.id)}
                  >
                    Notify Students
                  </button>
                )}

                <button
                  className="start-btn"
                  onClick={() => handleStartSession(session.id)}
                >
                  Start Session
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {showModal && (
        <CreateSessionModal
          onClose={() => setShowModal(false)}
          onCreateSession={handleCreateSession}
        />
      )}
    </div>
  );
}

export default TrainerDashboard;