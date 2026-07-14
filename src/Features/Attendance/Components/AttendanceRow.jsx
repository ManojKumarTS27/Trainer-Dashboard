function formatDateTime(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusClass(status) {
  const normalizedStatus = String(
    status || ""
  ).toLowerCase();

  if (normalizedStatus === "present") {
    return "attendance-status-badge--present";
  }

  if (normalizedStatus === "absent") {
    return "attendance-status-badge--absent";
  }

  if (normalizedStatus === "late") {
    return "attendance-status-badge--late";
  }

  return "attendance-status-badge--unknown";
}

function AttendanceRow({
  attendance,
  onViewDetails,
}) {
  return (
    <tr>
      <td data-label="Student Name">
        <div className="attendance-student-cell">
          <div className="attendance-student-avatar">
            {attendance.studentName
              ?.charAt(0)
              .toUpperCase() || "S"}
          </div>

          <div>
            <strong>{attendance.studentName}</strong>

            {attendance.studentEmail && (
              <span>{attendance.studentEmail}</span>
            )}
          </div>
        </div>
      </td>

      <td data-label="Session Name">
        {attendance.sessionName}
      </td>

      <td data-label="Join Time">
        {formatDateTime(attendance.joinTime)}
      </td>

      <td data-label="Leave Time">
        {formatDateTime(attendance.leaveTime)}
      </td>

      <td data-label="Duration">
        {attendance.formattedDuration}
      </td>

      <td data-label="Attendance Status">
        <span
          className={`attendance-status-badge ${getStatusClass(
            attendance.status
          )}`}
        >
          {attendance.status}
        </span>
      </td>

      <td data-label="Actions">
        <button
          type="button"
          className="attendance-view-button"
          onClick={() =>
            onViewDetails(attendance)
          }
        >
          View Details
        </button>
      </td>
    </tr>
  );
}

export default AttendanceRow;