import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecordingDashboard.css";

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

function getStoredRecordings() {
  try {
    const storedRecordings = JSON.parse(
      localStorage.getItem("uploadedRecordings") ||
        "[]"
    );

    return Array.isArray(storedRecordings)
      ? storedRecordings
      : [];
  } catch (error) {
    console.error(
      "Unable to read recordings:",
      error
    );

    return [];
  }
}

function RecordingDashboard() {
  const navigate = useNavigate();

  const [user] = useState(getStoredUser);

  const [recordings, setRecordings] = useState(
    getStoredRecordings
  );

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!user || !token) {
      localStorage.removeItem("token");
      localStorage.removeItem("authUser");
      localStorage.removeItem("isLoggedIn");

      navigate("/login", { replace: true });
    }
  }, [navigate, user]);

  const deleteRecording = (recordingId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this recording?"
    );

    if (!confirmDelete) {
      return;
    }

    setRecordings((previousRecordings) => {
      const updatedRecordings =
        previousRecordings.filter(
          (recording) =>
            recording.id !== recordingId
        );

      localStorage.setItem(
        "uploadedRecordings",
        JSON.stringify(updatedRecordings)
      );

      return updatedRecordings;
    });
  };

  const downloadRecording = (recording) => {
    if (!recording.fileUrl) {
      alert("No video available.");
      return;
    }

    const link = document.createElement("a");

    link.href = recording.fileUrl;
    link.download =
      recording.fileName || "recording.mp4";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return null;
  }

  const canManageRecordings =
    user.role === "Teacher" ||
    user.role === "Admin";

  return (
    <div className="recording-dashboard">
      <div className="recording-header">
        <div>
          <h1>Recording Dashboard</h1>

          <p>
            Logged in as{" "}
            <strong>
              {user.name || "User"} ({user.role})
            </strong>
          </p>
        </div>

        <div className="recording-header-actions">
          {canManageRecordings && (
            <button
              type="button"
              className="upload-btn"
              onClick={() =>
                navigate("/upload-recording")
              }
            >
              Upload Recording
            </button>
          )}

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/")}
          >
            Dashboard
          </button>
        </div>
      </div>

      <div className="recording-section">
        {recordings.length === 0 ? (
          <div className="empty-box">
            <h2>No Recordings Found</h2>

            <p>
              Upload a recording to see it here.
            </p>
          </div>
        ) : (
          <div className="recording-grid">
            {recordings.map((recording) => (
              <div
                className="recording-card"
                key={recording.id}
              >
                <div className="recording-icon">
                  🎥
                </div>

                <h3>
                  {recording.sessionName ||
                    "Untitled Session"}
                </h3>

                <p>
                  <strong>Duration:</strong>{" "}
                  {recording.duration ||
                    "Not provided"}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {recording.uploadedDate ||
                    "Not provided"}
                </p>

                <p>
                  <strong>File:</strong>{" "}
                  {recording.fileName ||
                    "No file name"}
                </p>

                {recording.fileUrl && (
                  <video
                    controls
                    className="recording-video"
                  >
                    <source
                      src={recording.fileUrl}
                      type="video/mp4"
                    />

                    Your browser does not support
                    video playback.
                  </video>
                )}

                <div className="recording-actions">
                  <button
                    type="button"
                    className="play-btn"
                    onClick={() =>
                      navigate(
                        "/session-recordings"
                      )
                    }
                  >
                    View
                  </button>

                  <button
                    type="button"
                    className="download-btn"
                    onClick={() =>
                      downloadRecording(recording)
                    }
                  >
                    Download
                  </button>

                  {canManageRecordings && (
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        deleteRecording(
                          recording.id
                        )
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecordingDashboard;
