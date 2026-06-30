import AmongUsIcon from '../AmongUsIcon';

export default function PersonalProfileView({ data, crewmate }) {
  if (!data || !data.crewId) return <p style={{ color: '#5a6c7f' }}>No profile data available.</p>;

  const xpPct = Math.round((data.xp / data.maxXp) * 100);

  return (
    <div className="ppv-root">
      {/* ── Left column: avatar + level + rating ── */}
      <div className="ppv-left">
        {/* Avatar card */}
        <div className="ppv-avatar-card">
          <div className="ppv-online-dot">ONLINE</div>
          <div className="ppv-avatar">
            <AmongUsIcon color={crewmate.color} />
          </div>
          <div className="ppv-avatar-role">{data.rank}</div>
          <div className="ppv-avatar-name">{crewmate.displayName}</div>
          <div className="ppv-avatar-role" style={{ fontSize: '0.55rem', marginTop: 2 }}>
            Crew ID: {data.crewId}
          </div>
        </div>

        {/* Level & XP */}
        <div className="ppv-level-card">
          <div className="ppv-level-num">{data.level}</div>
          <div className="ppv-level-info">
            <div className="ppv-level-label">Level &amp; XP</div>
            <div className="ppv-xp-bar">
              <div className="ppv-xp-fill" style={{ width: `${xpPct}%` }} />
            </div>
            <div className="ppv-xp-text">XP: {data.xp}/{data.maxXp}</div>
          </div>
        </div>

        {/* Rating */}
        <div className="ppv-rating-card">
          <div className="ppv-rating-icon">📊</div>
          <div className="ppv-rating-info">
            <div className="ppv-rating-label">Rating</div>
            <div className="ppv-rating-value">{data.rating.toLocaleString()}</div>
            <div className="ppv-rating-pct">{data.ratingPct}</div>
          </div>
        </div>
      </div>

      {/* ── Right column: personal log + game stats ── */}
      <div className="ppv-right">
        <div>
          <div className="ppv-section-label">Personal Log</div>
          <h3 className="ppv-name">
            {crewmate.displayName}
            <span className="ppv-name-role">{data.rank}</span>
          </h3>
        </div>

        {/* Info table */}
        <table className="ppv-info-table">
          <tbody>
            <tr><td>Crew ID</td><td>{data.crewId}</td></tr>
            <tr><td>Date Joined</td><td>{data.dateJoined}</td></tr>
            <tr><td>Gender</td><td>{data.gender}</td></tr>
            <tr><td>Blood Type</td><td>{data.bloodType}</td></tr>
            <tr><td>Rank</td><td>{data.rank}</td></tr>
            <tr><td>Home Planet</td><td>{data.homePlanet}</td></tr>
            <tr>
              <td>Certification</td>
              <td className={data.certSuspicious ? 'ppv-suspicious-val' : ''}>
                {data.certification}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Game stats */}
        <div className="ppv-game-stats">
          <div className="ppv-game-stats-title">GAME STATS</div>
          <div className="ppv-game-stats-grid">
            <div>
              <div className="ppv-stat-value">{data.gameStats.gamesPlayed}</div>
              <div className="ppv-stat-label">Games Played</div>
            </div>
            <div>
              <div className="ppv-stat-value">{data.gameStats.wins}</div>
              <div className="ppv-stat-label">Wins</div>
            </div>
            <div>
              <div className="ppv-stat-value">{data.gameStats.tasksCompleted}</div>
              <div className="ppv-stat-label">Tasks Done</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
