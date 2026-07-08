import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecordingDashboard.css";

function UploadRecordingModal() {
  const navigate = useNavigate();

  const sessions = [
    "React Basics",
    "JavaScript Advanced",
    "MongoDB Session",
    "Node.js Backend",
    "Digital Classroom Training",
  ];

  const [formData, setFormData] = useState({
    session: "",
    title: "",
    video: null,
    duration: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.session) newErrors.session = "Please select a session";
    if (!formData.title.trim()) newErrors.title = "Recording title is required";
    if (!formData.video) newErrors.video = "Please upload a video";
    if (!formData.duration.trim()) newErrors.duration = "Duration is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newRecording = {
      id: `REC-${Date.now()}`,
      sessionName: formData.title,
      duration: formData.duration,
      uploadedDate: new Date().toISOString().split("T")[0],
      fileName: formData.video.name,
    };

    const oldRecordings =
      JSON.parse(localStorage.getItem("uploadedRecordings")) || [];

    const updatedRecordings = [...oldRecordings, newRecording];

    localStorage.setItem(
      "uploadedRecordings",
      JSON.stringify(updatedRecordings)
    );

    alert("Recording uploaded successfully!");
    navigate("/session-recordings");
  };

  return (
    <div className="modal-overlay">
      <div className="upload-modal">
        <div className="modal-header">
          <h2>Upload Recording</h2>

          <button
            type="button"
            className="close-btn"
            onClick={() => navigate("/session-recordings")}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label>Session</label>
            <select
              name="session"
              value={formData.session}
              onChange={handleChange}
            >
              <option value="">Select Session</option>
              {sessions.map((session, index) => (
                <option key={index} value={session}>
                  {session}
                </option>
              ))}
            </select>
            {errors.session && <span>{errors.session}</span>}
          </div>

          <div className="form-group">
            <label>Recording Title</label>
            <input
              type="text"
              name="title"
              placeholder="Enter recording title"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <span>{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>Upload Video</label>
            <input
              type="file"
              name="video"
              accept="video/*"
              onChange={handleChange}
            />
            {errors.video && <span>{errors.video}</span>}
          </div>

          <div className="form-group">
            <label>Duration</label>
            <input
              type="text"
              name="duration"
              placeholder="Example: 45 mins"
              value={formData.duration}
              onChange={handleChange}
            />
            {errors.duration && <span>{errors.duration}</span>}
          </div>

          <button type="submit" className="submit-btn">
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadRecordingModal;