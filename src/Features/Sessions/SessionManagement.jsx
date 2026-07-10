import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SessionManagement.css";

const emptyForm = {
  sessionName: "",
  trainerName: "",
  date: "",
  time: "",
  duration: "",
  status: "Upcoming",
};

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
      "Unable to read stored sessions:",
      error
    );

    return [];
  }
}

function SessionManagement() {
  const navigate = useNavigate();

  const [user] = useState(getStoredUser);

  const [sessions, setSessions] = useState(
    getStoredSessions
  );

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!user || !token) {
      localStorage.removeItem("token");
      localStorage.removeItem("authUser");
      localStorage.removeItem("isLoggedIn");

      navigate("/login", { replace: true });
      return;
    }

    if (
      user.role !== "Teacher" &&
      user.role !== "Admin"
    ) {
      navigate("/access-denied", {
        replace: true,
      });
    }
  }, [navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const sessionData = {
      sessionName: form.sessionName.trim(),
      trainerName: form.trainerName.trim(),
      date: form.date,
      time: form.time,
      duration: form.duration.trim(),
      status: form.status,
    };

    if (
      !sessionData.sessionName ||
      !sessionData.trainerName ||
      !sessionData.date ||
      !sessionData.time ||
      !sessionData.duration
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const newSession = {
      id: `SES-${Date.now()}`,
      ...sessionData,
    };

    setSessions((previousSessions) => {
      const updatedSessions = [
        newSession,
        ...previousSessions,
      ];

      localStorage.setItem(
        "sessions",
        JSON.stringify(updatedSessions)
      );

      return updatedSessions;
    });

    setForm(emptyForm);

    alert("Session created successfully.");
  };

  const deleteSession = (sessionId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this session?"
    );

    if (!confirmDelete) {
      return;
    }

    setSessions((previousSessions) => {
      const updatedSessions =
        previousSessions.filter(
          (session) => session.id !== sessionId
        );

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

  return (
    <div className="session-page">
      <div className="session-header">
        <div>
          <h1>Session Management</h1>

          <p>
            Logged in as{" "}
            <strong>
              {user.name || "User"} ({user.role})
            </strong>
          </p>
        </div>

        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/")}
        >
          Dashboard
        </button>
      </div>

      <div className="session-layout">
        <div className="session-form">
          <h2>Create Session</h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="sessionName">
              Session Name
            </label>

            <input
              id="sessionName"
              type="text"
              name="sessionName"
              placeholder="Enter session name"
              value={form.sessionName}
              onChange={handleChange}
              required
            />

            <label htmlFor="trainerName">
              Trainer Name
            </label>

            <input
              id="trainerName"
              type="text"
              name="trainerName"
              placeholder="Enter trainer name"
              value={form.trainerName}
              onChange={handleChange}
              required
            />

            <label htmlFor="date">
              Session Date
            </label>

            <input
              id="date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />

            <label htmlFor="time">
              Session Time
            </label>

            <input
              id="time"
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            />

            <label htmlFor="duration">
              Duration
            </label>

            <input
              id="duration"
              type="text"
              name="duration"
              placeholder="Example: 45 mins"
              value={form.duration}
              onChange={handleChange}
              required
            />

            <label htmlFor="status">
              Status
            </label>

            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Upcoming">
                Upcoming
              </option>

              <option value="Live">
                Live
              </option>

              <option value="Completed">
                Completed
              </option>
            </select>

            <button
              className="submit-btn"
              type="submit"
            >
              Save Session
            </button>
          </form>
        </div>

        <div className="session-content">
          <h2>All Sessions</h2>

          {sessions.length === 0 ? (
            <div className="empty-box">
              <h3>No sessions available</h3>

              <p>
                Create your first training session
                using the form.
              </p>
            </div>
          ) : (
            <div className="session-table-wrapper">
              <table className="session-table">
                <thead>
                  <tr>
                    <th>ID</th>
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
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td>{session.id}</td>

                      <td>
                        {session.sessionName}
                      </td>

                      <td>
                        {session.trainerName}
                      </td>

                      <td>{session.date}</td>

                      <td>{session.time}</td>

                      <td>
                        {session.duration ||
                          "Not provided"}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${String(
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
                          className="delete-btn"
                          onClick={() =>
                            deleteSession(session.id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SessionManagement;
