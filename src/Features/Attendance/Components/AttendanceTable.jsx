import AttendanceRow from "./AttendanceRow";

function AttendanceTable({
  attendanceRecords,
  onViewDetails,
}) {
  if (attendanceRecords.length === 0) {
    return (
      <div className="attendance-empty-state">
        <div className="attendance-empty-state__icon">
          📋
        </div>

        <h3>No attendance records found</h3>

        <p>
          Try changing the search text or attendance
          filters.
        </p>
      </div>
    );
  }

  return (
    <div className="attendance-table-wrapper">
      <table className="attendance-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Session Name</th>
            <th>Join Time</th>
            <th>Leave Time</th>
            <th>Duration</th>
            <th>Attendance Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {attendanceRecords.map((attendance) => (
            <AttendanceRow
              key={attendance.id}
              attendance={attendance}
              onViewDetails={onViewDetails}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceTable;