import { useState } from "react";
import UploadRecordingModal from "./UploadRecordingModal";
import "./RecordingDashboard.css";

function RecordingDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [recordings, setRecordings] = useState([
    {
      id: "REC-1001",
      session: "React Basics",
      title: "Introduction to React",
      videoName: "react-session.mp4",
      duration: "45 mins",
      videoURL: "",
    },
  ]);

  const sessions = [
    "React Basics",
    "JavaScript Advanced",
    "MongoDB Session",
    "Node.js Backend",
    "Digital Classroom Training",
  ];

  const handleUploadRecording = (newRecording) => {
    setRecordings((prev) => [newRecording, ...prev]);
  };

  return (
    <div className="recording-dashboard">
      <div className="recording-header">
        <div>
          <h1>Recording Sessions</h1>
          <p>Manage and upload all class recording sessions</p>
        </div>

        <button className="upload-btn" onClick={() => setIsModalOpen(true)}>
          + Upload Recording
        </button>
      </div>

      <div className="recording-section">
        <h2>All Recorded Sessions</h2>

        {recordings.length === 0 ? (
          <div className="empty-box">
            <p>No recordings uploaded yet.</p>
          </div>
        ) : (
          <div className="recording-grid">
            {recordings.map((recording) => (
              <div className="recording-card" key={recording.id}>
                <div className="recording-icon">🎥</div>

                <h3>{recording.title}</h3>

                <p>
                  <strong>Session:</strong> {recording.session}
                </p>

                <p>
                  <strong>Video:</strong> {recording.videoName}
                </p>

                <p>
                  <strong>Duration:</strong> {recording.duration}
                </p>

                {recording.videoURL ? (
                  <>
                    <video className="recording-video" controls>
                      <source
                        src={recording.videoURL}
                        type={recording.video?.type}
                      />
                      Your browser does not support the video tag.
                    </video>

                    <a
                      href={recording.videoURL}
                      download={recording.videoName}
                      className="download-btn"
                    >
                      Download Video
                    </a>
                  </>
                ) : (
                  <p className="no-video">Sample video preview not available</p>
                )}

                <span className="recording-id">{recording.id}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <UploadRecordingModal
          sessions={sessions}
          onClose={() => setIsModalOpen(false)}
          onUpload={handleUploadRecording}
        />
      )}
    </div>
  );
}

export default RecordingDashboard;