import { CREWMATES } from '../data/mockData';
import '../styles/CrewmateSelection.css';

/* Gold folder icon for each crewmate — no hover effects */
function FolderIcon() {
  return (
    <div className="cs-folder-icon">
      <div className="cs-folder-tab" />
      <div className="cs-folder-body" />
    </div>
  );
}

export default function CrewmateSelection({ onCrewmateSelect }) {
  return (
    <div className="cs-container">
      <div className="cs-grid">
        {CREWMATES.map(cm => (
          <button
            key={cm.id}
            className="cs-folder"
            onClick={() => onCrewmateSelect(cm)}
          >
            <FolderIcon />
            <span className="cs-folder-label">{cm.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
