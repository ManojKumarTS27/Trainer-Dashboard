import { useState } from "react";
import "./SessionManagement.css";

const defaultSessions = [
  {
    id: "SES-1001",
    sessionName: "React Basics",
    trainerName: "Arun Kumar",
    date: "2026-07-10",
    time: "10:00",
    duration: "45 mins",
    status: "Upcoming",
    description: "Introduction to React components and props.",
  },
  {
    id: "SES-1002",
    sessionName: "JavaScript Advanced",
    trainerName: "Priya Sharma",
    date: "2026-07-09",
    time: "14:30",
    duration: "60 mins",
    status: "Live",
    description: "Advanced JavaScript concepts.",
  },
];

function SessionManagement() {
  const [sessions, setSessions] = useState(defaultSessions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    sessionName: "",
    trainerName: "",
    date: "",
    time: "",
    duration: "",
    status: "Upcoming",
    description: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      sessionName: "",
      trainerName: "",
      date: "",
      time: "",
      duration: "",
      status: "Upcoming",
      description: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.sessionName ||
      !form.trainerName ||
      !form.date ||
      !form.time ||
      !form.duration
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (editingId) {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === editingId ? { ...session, ...form } : session
        )
      );
    } else {
      const newSession = {
        id: `SES-${Date.now().toString().slice(-4)}`,
        ...form,
      };

      setSessions((prev) => [newSession, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (session) => {
    setEditingId(session.id);
    setForm({
      sessionName: session.sessionName,
      trainerName: session.trainerName,
      date: session.date,
      time: session.time,
      duration: session.duration,
      status: session.status,
      description: session.description,
    });
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this session?"
    );

    if (confirmDelete) {
      setSessions((prev) => prev.filter((session) => session.id !== id));
    }
  };

  const handleJoin = (session) => {
    alert(`Joining virtual classroom: ${session.sessionName}`);
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.sessionName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || session.status === statusFilter;

    const matchesDate = !dateFilter || session.date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="session-page">
      <div className="session-header">
        <div>
          <h1>Session Management</h1>
          <p>Manage scheduled training sessions and virtual classes</p>
        </div>
      </div>

      <div className="session-layout">
        <form className="session-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit Session" : "Add New Session"}</h2>

          <input
            type="text"
            name="sessionName"
            placeholder="Session Name"
            value={form.sessionName}
            onChange={handleChange}
          />

          <input
            type="text"
            name="trainerName"
            placeholder="Trainer Name"
            value={form.trainerName}
            onChange={handleChange}
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />

          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
          />

          <input
            type="text"
            name="duration"
            placeholder="Duration eg: 45 mins"
            value={form.duration}
            onChange={handleChange}
          />

          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Upcoming">Upcoming</option>
            <option value="Live">Live</option>
            <option value="Completed">Completed</option>
          </select>

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />

          <button type="submit" className="submit-btn">
            {editingId ? "Update Session" : "Add Session"}
          </button>

          {editingId && (
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>

        <div className="session-content">
          <div className="filters">
            <input
              type="text"
              placeholder="Search by session name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Live">Live</option>
              <option value="Completed">Completed</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />

            <button className="clear-btn" onClick={() => setDateFilter("")}>
              Clear Date
            </button>
          </div>

          <div className="session-list">
            {filteredSessions.length === 0 ? (
              <div className="empty-box">No sessions found</div>
            ) : (
              filteredSessions.map((session) => (
                <div className="session-card" key={session.id}>
                  <div className="card-top">
                    <div>
                      <h3>{session.sessionName}</h3>
                      <p>{session.id}</p>
                    </div>

                    <span className={`status ${session.status.toLowerCase()}`}>
                      {session.status}
                    </span>
                  </div>

                  <div className="details-grid">
                    <p>
                      <strong>Trainer:</strong> {session.trainerName}
                    </p>
                    <p>
                      <strong>Date:</strong> {session.date}
                    </p>
                    <p>
                      <strong>Time:</strong> {session.time}
                    </p>
                    <p>
                      <strong>Duration:</strong> {session.duration}
                    </p>
                  </div>

                  <p className="description">{session.description}</p>

                  <div className="card-actions">
                    <button
                      className="join-btn"
                      onClick={() => handleJoin(session)}
                    >
                      Join Session
                    </button>

                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(session)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(session.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionManagement;