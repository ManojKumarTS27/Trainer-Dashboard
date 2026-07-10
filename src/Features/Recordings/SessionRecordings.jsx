import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SessionRecordings.css";

function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("authUser") || "null"
    );
  } catch {
    return null;
  }
}

function getStoredRecordings() {
  try {
    const storedRecordings = JSON.parse(
      localStorage.getItem("uploadedRecordings") || "[]"
    );

    return Array.isArray(storedRecordings)
      ? storedRecordings
      : [];
  } catch {
    return [];
  }
}

function SessionRecordings() {
  const navigate = useNavigate();

  const [user] = useState(getStoredUser);
  const [recordings, setRecordings] = useState(
    getStoredRecordings
  );
  const [search, setSearch] = useState("");
  const [selectedVideo, setSelectedVideo] =
    useState(null);

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

    if (selectedVideo?.id === recordingId) {
      setSelectedVideo(null);
    }
  };

  const downloadRecording = (recording) => {
    if (!recording.fileUrl) {
      alert("Video unavailable.");
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

  const filteredRecordings = recordings.filter(
    (recording) => {
      const sessionName =
        recording.sessionName || "";

      return sessionName
        .toLowerCase()
        .includes(search.trim().toLowerCase());
    }
  );

  const canManageRecordings =
    user?.role === "Teacher" ||
    user?.role === "Admin";

  return (
    <div className="recordings-page">
      <div className="recordings-header">
        <div>
          <h1>Session Recordings</h1>

          <p>
            Search, watch and manage recordings
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

      <div className="recordings-card">
        <input
          type="search"
          className="search-input"
          placeholder="Search session..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <div className="recording-grid">
          {filteredRecordings.length === 0 ? (
            <div className="empty-box">
              <h3>No recordings found</h3>
              <p>
                Upload a recording or try another
                search.
              </p>
            </div>
          ) : (
            filteredRecordings.map((recording) => (
              <div
                key={recording.id}
                className="recording-card"
              >
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

                <div className="recording-actions">
                  <button
                    type="button"
                    className="play-btn"
                    onClick={() =>
                      setSelectedVideo(recording)
                    }
                  >
                    Play
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
                        deleteRecording(recording.id)
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedVideo && (
        <div className="video-modal">
          <div className="video-container">
            <div className="video-header">
              <h2>
                {selectedVideo.sessionName ||
                  "Session Recording"}
              </h2>

              <button
                type="button"
                className="close-btn"
                onClick={() =>
                  setSelectedVideo(null)
                }
              >
                ✕
              </button>
            </div>

            {selectedVideo.fileUrl ? (
              <video
                controls
                autoPlay
                className="video-player"
              >
                <source
                  src={selectedVideo.fileUrl}
                  type="video/mp4"
                />

                Your browser does not support video
                playback.
              </video>
            ) : (
              <div className="empty-box">
                <h3>Video Not Available</h3>

                <p>
                  This recording does not contain
                  an uploaded video file.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionRecordings;
