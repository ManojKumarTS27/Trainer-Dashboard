import { useState } from "react";
import "./TrainerDashboard.css";

function CreateSessionModal({ onClose, onCreateSession }) {
  const [batch, setBatch] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!batch || !date || !time) {
      alert("Please fill all fields");
      return;
    }

    const newSession = {
      id: "ROOM-" + Math.floor(100000 + Math.random() * 900000),
      batch,
      date,
      time,
      notified: false,
    };

    onCreateSession(newSession);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="session-modal">
        <div className="modal-header">
          <h2>Create Live Session</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Select Batch</label>
          <select value={batch} onChange={(e) => setBatch(e.target.value)}>
            <option value="">Choose Batch</option>
            <option value="Batch A - React">Batch A - React</option>
            <option value="Batch B - Full Stack">Batch B - Full Stack</option>
            <option value="Batch C - Python">Batch C - Python</option>
          </select>

          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label>Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <button type="submit" className="generate-btn">
            Generate Meeting
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateSessionModal;