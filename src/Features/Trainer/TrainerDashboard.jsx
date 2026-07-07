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
  };

  const handleNotify = (sessionId) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId
          ? { ...session, notified: true }
          : session
      )
    );

    alert("Students notified successfully!");
  };

  const handleStartSession = (sessionId) => {
    navigate(`/digital-classroom/${sessionId}`);
  };

  return (
    <div className="trainer-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Trainer Dashboard</h1>
          <p>Manage your scheduled live classes</p>
        </div>

        <div className="header-actions">
          <button
            className="recording-btn"
            onClick={() => navigate("/recordings")}
          >
            📹 Recording Dashboard
          </button>

          <button
            className="create-btn"
            onClick={() => setShowModal(true)}
          >
            + Create Live Session
          </button>
        </div>
      </div>

      <div className="sessions-section">
        <h2>Upcoming Sessions</h2>

        {sessions.length === 0 ? (
          <p className="empty-text">No sessions scheduled yet.</p>
        ) : (
          <div className="sessions-grid">
            {sessions.map((session) => (
              <div className="session-card" key={session.id}>
                <h3>{session.batch}</h3>

                <p>
                  <strong>Room ID:</strong> {session.id}
                </p>

                <p>
                  <strong>Date:</strong> {session.date}
                </p>

                <p>
                  <strong>Time:</strong> {session.time}
                </p>

                <div className="card-actions">
                  {session.notified ? (
                    <button className="notified-badge" disabled>
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
              </div>
            ))}
          </div>
        )}
      </div>

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