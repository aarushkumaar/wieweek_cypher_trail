import { useState } from 'react';
import TabletFrame from './components/TabletFrame';
import CrewmateSelection from './components/CrewmateSelection';
import FileExplorer from './components/FileExplorer';
import FolderViewer from './components/FolderViewer';
import { CREWMATES } from './data/mockData';

/*
  Round 5 — The Cypher Trail
  ──────────────────────────
  Flow:  selection → explorer → viewer
  • selection : pick a crewmate (5 gold folders in a tablet)
  • explorer  : browse 4 data folders for that crewmate (tablet)
  • viewer    : fullscreen dark view with sidebar, data, and ACCUSE button
*/

const STAGES = { SELECTION: 'selection', EXPLORER: 'explorer', VIEWER: 'viewer' };

export default function Round5({ onComplete }) {
  const [stage, setStage] = useState(STAGES.SELECTION);
  const [selectedCrewmate, setCrewmate] = useState(null);
  const [selectedFolder, setFolder] = useState(null);

  /* ── Stage handlers ── */
  const handleCrewmateSelect = (crewmate) => {
    setCrewmate(crewmate);
    setStage(STAGES.EXPLORER);
  };

  const handleFolderOpen = (folder) => {
    setFolder(folder);
    setStage(STAGES.VIEWER);
  };

  const handleBackToExplorer = () => {
    setFolder(null);
    setStage(STAGES.EXPLORER);
  };

  const handleBackToSelection = () => {
    setCrewmate(null);
    setFolder(null);
    setStage(STAGES.SELECTION);
  };

  /* ── Render ── */

  // Tablet-framed screens (selection + explorer)
  if (stage === STAGES.SELECTION) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(145deg, #0a4a5a, #0d6b7f)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <TabletFrame>
          <CrewmateSelection onCrewmateSelect={handleCrewmateSelect} />
        </TabletFrame>
      </div>
    );
  }

  if (stage === STAGES.EXPLORER) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(145deg, #0a4a5a, #0d6b7f)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <TabletFrame>
          <FileExplorer
            crewmate={selectedCrewmate}
            onFolderOpen={handleFolderOpen}
            onBack={handleBackToSelection}
          />
        </TabletFrame>
      </div>
    );
  }

  // Fullscreen dark viewer
  return (
    <FolderViewer
      crewmate={selectedCrewmate}
      initialFolder={selectedFolder}
      onBack={handleBackToExplorer}
      onRoundComplete={onComplete}
    />
  );
}
