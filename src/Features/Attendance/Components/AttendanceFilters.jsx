function AttendanceFilters({
  filters,
  sessions,
  onFilterChange,
  onClearFilters,
  resultCount,
}) {
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    onFilterChange({
      ...filters,
      [name]: value,
    });
  };

  const filtersAreActive =
    filters.search.trim() ||
    filters.session ||
    filters.status ||
    filters.date;

  return (
    <section className="attendance-filters">
      <div className="attendance-filters__header">
        <div>
          <h2>Attendance Records</h2>

          <p>
            {resultCount}{" "}
            {resultCount === 1 ? "record" : "records"}{" "}
            found
          </p>
        </div>

        {filtersAreActive && (
          <button
            type="button"
            className="attendance-clear-button"
            onClick={onClearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="attendance-filters__controls">
        <div className="attendance-filter-group attendance-filter-group--search">
          <label htmlFor="attendance-search">
            Search Student
          </label>

          <div className="attendance-search-input">
            <span aria-hidden="true">⌕</span>

            <input
              id="attendance-search"
              type="search"
              name="search"
              value={filters.search}
              onChange={handleInputChange}
              placeholder="Enter student name"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="attendance-filter-group">
          <label htmlFor="attendance-session">
            Session
          </label>

          <select
            id="attendance-session"
            name="session"
            value={filters.session}
            onChange={handleInputChange}
          >
            <option value="">All Sessions</option>

            {sessions.map((session) => (
              <option
                key={session.id}
                value={session.id}
              >
                {session.name}
              </option>
            ))}
          </select>
        </div>

        <div className="attendance-filter-group">
          <label htmlFor="attendance-status">
            Status
          </label>

          <select
            id="attendance-status"
            name="status"
            value={filters.status}
            onChange={handleInputChange}
          >
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </select>
        </div>

        <div className="attendance-filter-group">
          <label htmlFor="attendance-date">
            Date
          </label>

          <input
            id="attendance-date"
            type="date"
            name="date"
            value={filters.date}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </section>
  );
}

export default AttendanceFilters;