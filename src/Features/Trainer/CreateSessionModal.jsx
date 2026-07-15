import { useState } from "react";
import "./CreateSessionModal.css";

function CreateSessionModal({
  onClose,
  onCreateSession,
  defaultTrainerName = "",
}) {
  const [form, setForm] = useState({
    sessionName: "",
    batch: "",
    trainerName: defaultTrainerName,
    date: "",
    time: "",
    duration: "60 minutes",
    status: "Upcoming",
    description: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !form.sessionName.trim() ||
      !form.batch ||
      !form.date ||
      !form.time
    ) {
      setError(
        "Session name, batch, date and time are required."
      );

      return;
    }

    onCreateSession(form);
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className="session-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            <p>Create virtual classroom</p>
            <h2>Create Live Session</h2>
          </div>

          <button
            type="button"
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form
          className="create-session-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="session-form-error">
              {error}
            </div>
          )}

          <label>
            Session Name

            <input
              type="text"
              name="sessionName"
              value={form.sessionName}
              onChange={handleChange}
              placeholder="React Hooks"
            />
          </label>

          <label>
            Select Batch

            <select
              name="batch"
              value={form.batch}
              onChange={handleChange}
            >
              <option value="">
                Choose Batch
              </option>

              <option value="Batch A - React">
                Batch A - React
              </option>

              <option value="Batch B - Full Stack">
                Batch B - Full Stack
              </option>

              <option value="Batch C - Python">
                Batch C - Python
              </option>
            </select>
          </label>

          <label>
            Trainer Name

            <input
              type="text"
              name="trainerName"
              value={form.trainerName}
              onChange={handleChange}
              placeholder="Trainer name"
            />
          </label>

          <div className="session-form-row">
            <label>
              Date

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </label>

            <label>
              Time

              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="session-form-row">
            <label>
              Duration

              <select
                name="duration"
                value={form.duration}
                onChange={handleChange}
              >
                <option value="30 minutes">
                  30 minutes
                </option>

                <option value="45 minutes">
                  45 minutes
                </option>

                <option value="60 minutes">
                  60 minutes
                </option>

                <option value="90 minutes">
                  90 minutes
                </option>
              </select>
            </label>

            <label>
              Status

              <select
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
              </select>
            </label>
          </div>

          <label>
            Description

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter session description..."
              rows="4"
            />
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="generate-btn"
            >
              Create Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateSessionModal;