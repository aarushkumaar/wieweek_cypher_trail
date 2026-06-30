export default function TaskHistoryView({ data }) {
  if (!data || data.length === 0) return <p style={{ color: '#5a6c7f' }}>No task history available.</p>;

  return (
    <table className="thv-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Task</th>
          <th>Location</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {data.map(t => (
          <tr key={t.id}>
            <td>{t.id}</td>
            <td>{t.task}</td>
            <td>{t.location}</td>
            <td>
              <span className={`thv-status ${t.status.toLowerCase()}`}>
                {t.status}
              </span>
            </td>
            <td>{t.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
