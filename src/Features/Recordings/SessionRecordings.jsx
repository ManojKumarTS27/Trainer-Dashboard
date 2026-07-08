import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SessionRecordings.css";

const defaultRecordings = [
  {
    id: "REC-1001",
    sessionName: "React Basics",
    duration: "45 mins",
    uploadedDate: "2026-07-08",
    fileName: "react-basics.mp4",
    fileUrl: "",
  },
  {
    id: "REC-1002",
    sessionName: "JavaScript Advanced",
    duration: "55 mins",
    uploadedDate: "2026-07-08",
    fileName: "javascript-advanced.mp4",
    fileUrl: "",
  },
];

function SessionRecordings() {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [recordings, setRecordings] = useState(() => {
    const uploadedRecordings =
      JSON.parse(localStorage.getItem("uploadedRecordings")) || [];

    return [...defaultRecordings, ...uploadedRecordings];
  });

  const handlePlay = (recording) => {
    if (!recording.fileUrl) {
      alert("This is a sample recording. Upload a real video to play.");
      return;
    }

    setSelectedVideo(recording);
  };

  const handleDownload = (recording) => {
    if (!recording.fileUrl) {
      alert("This is a sample recording.");
      return;
    }

    const link = document.createElement("a");
    link.href = recording.fileUrl;
    link.download = recording.fileName;
    link.click();
  };

  const handleDelete = (recordingId) => {
    if (window.confirm("Are you sure you want to delete this recording?")) {
      const updated = recordings.filter(
        (recording) => recording.id !== recordingId
      );

      setRecordings(updated);

      const uploadedOnly = updated.filter(
        (recording) =>
          recording.id !== "REC-1001" && recording.id !== "REC-1002"
      );

      localStorage.setItem(
        "uploadedRecordings",
        JSON.stringify(uploadedOnly)
      );
    }
  };

  return (
    <div className="recordings-page">
      <div className="recordings-card">
        <div className="recordings-header">
          <div>
            <h1>Session Recordings</h1>
            <p>Manage, play, download, and delete session recordings</p>
          </div>

          <button
            className="back-btn"
            onClick={() => navigate("/trainer-dashboard")}
          >
            ← Trainer Dashboard
          </button>
        </div>

        <div className="recordings-table-wrapper">
          <table className="recordings-table">
            <thead>
              <tr>
                <th>Recording ID</th>
                <th>Session Name</th>
                <th>Duration</th>
                <th>Uploaded Date</th>
                <th>File Name</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {recordings.length > 0 ? (
                recordings.map((recording) => (
                  <tr key={recording.id}>
                    <td>{recording.id}</td>
                    <td>{recording.sessionName}</td>
                    <td>{recording.duration}</td>
                    <td>{recording.uploadedDate}</td>
                    <td>{recording.fileName}</td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="play-btn"
                          onClick={() => handlePlay(recording)}
                        >
                          ▶ Play
                        </button>

                        <button
                          className="download-btn"
                          onClick={() => handleDownload(recording)}
                        >
                          ⬇ Download
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(recording.id)}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-recordings">
                    No recordings available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedVideo && (
        <div className="video-modal-overlay">
          <div className="video-modal">
            <div className="video-modal-header">
              <h2>{selectedVideo.sessionName}</h2>

              <button onClick={() => setSelectedVideo(null)}>×</button>
            </div>

            <video controls autoPlay className="video-player">
              <source src={selectedVideo.fileUrl} type="video/mp4" />
              Your browser does not support video playback.
            </video>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionRecordings;