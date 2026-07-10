import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecordingDashboard.css";

function UploadRecordingModal() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    sessionName: "",
    duration: "",
    video: null,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setForm((prev) => ({
        ...prev,
        video: files[0],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.sessionName ||
      !form.duration ||
      !form.video
    ) {
      setError("Please complete all fields.");
      return;
    }

    const recording = {
      id: Date.now().toString(),
      sessionName: form.sessionName,
      duration: form.duration,
      uploadedDate: new Date()
        .toISOString()
        .split("T")[0],
      fileName: form.video.name,
      fileUrl: URL.createObjectURL(form.video),
    };

    const recordings = JSON.parse(
      localStorage.getItem("uploadedRecordings") ||
        "[]"
    );

    recordings.unshift(recording);

    localStorage.setItem(
      "uploadedRecordings",
      JSON.stringify(recordings)
    );

    alert("Recording uploaded successfully.");

    navigate("/recording-dashboard");
  };

  return (
    <div className="modal-overlay">

      <div className="upload-modal">

        <h2>Upload Recording</h2>

        <form onSubmit={handleSubmit}>

          <label>Session Name</label>

          <input
            type="text"
            name="sessionName"
            value={form.sessionName}
            onChange={handleChange}
            placeholder="React Basics"
          />

          <label>Duration</label>

          <input
            type="text"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            placeholder="45 mins"
          />

          <label>Video File</label>

          <input
            type="file"
            accept="video/*"
            onChange={handleChange}
          />

          {error && (
            <p
              style={{
                color: "red",
                marginTop: "10px",
              }}
            >
              {error}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginTop: "20px",
            }}
          >

            <button
              className="submit-btn"
              type="submit"
            >
              Upload
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                navigate(
                  "/recording-dashboard"
                )
              }
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default UploadRecordingModal;