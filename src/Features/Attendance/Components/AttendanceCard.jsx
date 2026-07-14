import AttendanceStatsCard from "./AttendanceStatsCard";

function AttendanceCard({ statistics }) {
  const {
    totalStudents,
    present,
    absent,
    attendancePercentage,
  } = statistics;

  return (
    <section className="attendance-statistics-grid">
      <AttendanceStatsCard
        title="Total Students"
        value={totalStudents}
        icon="👥"
        type="total"
        subtitle="Students in current results"
      />

      <AttendanceStatsCard
        title="Present"
        value={present}
        icon="✓"
        type="present"
        subtitle="Present and late students"
      />

      <AttendanceStatsCard
        title="Absent"
        value={absent}
        icon="✕"
        type="absent"
        subtitle="Students marked absent"
      />

      <AttendanceStatsCard
        title="Attendance Percentage"
        value={`${attendancePercentage}%`}
        icon="%"
        type="percentage"
        subtitle="Based on filtered results"
      />
    </section>
  );
}

export default AttendanceCard;