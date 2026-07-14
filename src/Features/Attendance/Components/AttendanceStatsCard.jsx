function AttendanceStatsCard({
  title,
  value,
  icon,
  type = "default",
  subtitle,
}) {
  return (
    <article
      className={`attendance-stats-card attendance-stats-card--${type}`}
    >
      <div className="attendance-stats-card__icon">
        {icon}
      </div>

      <div className="attendance-stats-card__content">
        <p className="attendance-stats-card__title">
          {title}
        </p>

        <h3 className="attendance-stats-card__value">
          {value}
        </h3>

        {subtitle && (
          <p className="attendance-stats-card__subtitle">
            {subtitle}
          </p>
        )}
      </div>
    </article>
  );
}

export default AttendanceStatsCard;