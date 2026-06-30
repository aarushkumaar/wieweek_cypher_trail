export default function AccessLogView({ data }) {
  if (!data || data.length === 0) return <p style={{ color: '#5a6c7f' }}>No access logs available.</p>;

  return (
    <div className="alv-container">
      {data.map((entry, i) => (
        <div key={i} className={`alv-entry ${entry.suspicious ? 'alv-suspicious' : ''}`}>
          <span className="alv-timestamp">{entry.timestamp}</span>
          <span className={`alv-badge ${entry.level.toLowerCase()}`}>
            {entry.level}
          </span>
          <span className="alv-action">{entry.action}</span>
          <span className="alv-detail">{entry.detail}</span>
          <span className="alv-location">{entry.location}</span>
        </div>
      ))}
    </div>
  );
}
