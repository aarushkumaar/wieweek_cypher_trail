export default function ShipRegulationsView({ data }) {
  if (!data || data.length === 0) return <p style={{ color: '#5a6c7f' }}>No regulations available.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ color: '#00d4ff', fontFamily: 'Orbitron, sans-serif', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        Ship Regulations
      </div>
      <div style={{ padding: '16px', border: '1px solid rgba(0, 212, 255, 0.15)', borderRadius: '10px', background: 'rgba(0, 212, 255, 0.04)', lineHeight: 1.7, color: '#dce7f2' }}>
        <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
