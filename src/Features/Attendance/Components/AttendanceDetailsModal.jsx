import { useEffect } from "react";

function formatFullDateTime(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeStyle: "medium",
  }).format(date);
}

function getStatusClass(status) {
  const normalizedStatus = String(
    status || ""
  ).toLowerCase();

  return `attendance-status-badge--${normalizedStatus}`;
}

function AttendanceDetailsModal({
  attendance,
  onClose,
}) {
  useEffect(() => {
    if (!attendance) {
      return undefined;
    }

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscapeKey
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscapeKey
      );

      document.body.style.overflow = "";
    };
  }, [attendance, onClose]);

  if (!attendance) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="attendance-modal-overlay"
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <div
        className="attendance-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-modal-title"
      >
        <div className="attendance-modal__header">
          <div>
            <p className="attendance-modal__eyebrow">
              Attendance Information
            </p>

            <h2 id="attendance-modal-title">
              Attendance Details
            </h2>
          </div>

          <button
            type="button"
            className="attendance-modal__close"
            onClick={onClose}
            aria-label="Close attendance details"
          >
            ×
          </button>
        </div>

        <div className="attendance-modal__body">
          <section className="attendance-detail-section">
            <h3>Student Information</h3>

            <div className="attendance-detail-profile">
              <div className="attendance-detail-profile__avatar">
                {attendance.studentName
                  ?.charAt(0)
                  .toUpperCase() || "S"}
              </div>

              <div>
                <strong>
                  {attendance.studentName}
                </strong>

                <span>
                  {attendance.studentEmail ||
                    "Email not available"}
                </span>

                <small>
                  Student ID:{" "}
                  {attendance.studentId ||
                    "Not available"}
                </small>
              </div>
            </div>
          </section>

          <section className="attendance-detail-section">
            <h3>Session Information</h3>

            <div className="attendance-detail-grid">
              <div className="attendance-detail-item">
                <span>Session Name</span>
                <strong>
                  {attendance.sessionName}
                </strong>
              </div>

              <div className="attendance-detail-item">
                <span>Session ID</span>
                <strong>
                  {attendance.sessionId ||
                    "Not available"}
                </strong>
              </div>
            </div>
          </section>

          <section className="attendance-detail-section">
            <h3>Attendance Timeline</h3>

            <div className="attendance-timeline">
              <div className="attendance-timeline__item">
                <div className="attendance-timeline__marker attendance-timeline__marker--join" />

                <div>
                  <span>Join Time</span>

                  <strong>
                    {formatFullDateTime(
                      attendance.joinTime
                    )}
                  </strong>
                </div>
              </div>

              <div className="attendance-timeline__line" />

              <div className="attendance-timeline__item">
                <div className="attendance-timeline__marker attendance-timeline__marker--leave" />

                <div>
                  <span>Leave Time</span>

                  <strong>
                    {formatFullDateTime(
                      attendance.leaveTime
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <section className="attendance-detail-section">
            <div className="attendance-detail-grid">
              <div className="attendance-detail-item attendance-detail-item--highlight">
                <span>Total Duration</span>

                <strong>
                  {attendance.formattedDuration}
                </strong>
              </div>

              <div className="attendance-detail-item attendance-detail-item--highlight">
                <span>Attendance Status</span>

                <strong>
                  <span
                    className={`attendance-status-badge ${getStatusClass(
                      attendance.status
                    )}`}
                  >
                    {attendance.status}
                  </span>
                </strong>
              </div>
            </div>
          </section>
        </div>

        <div className="attendance-modal__footer">
          <button
            type="button"
            className="attendance-modal__done-button"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default AttendanceDetailsModal;