import { useState, useEffect, useCallback } from 'react';
import TabletFrame from './components/TabletFrame';
import CrewmateSelection from './components/CrewmateSelection';
import FileExplorer from './components/FileExplorer';
import FolderViewer from './components/FolderViewer';
import { CREWMATES } from './data/mockData';

import {
  ROUND_NAMES,
  startRoundTimer,
  endRoundTimer,
  markRoundComplete,
} from '../../lib/scoringEngine.js';
import { submitRoundScore } from '../../lib/gameService.js';

/*
  Round 5 — The Cypher Trail
  ──────────────────────────
  Flow:  selection → explorer → viewer
  • selection : pick a crewmate (5 gold folders in a tablet)
  • explorer  : browse 4 data folders for that crewmate (tablet)
  • viewer    : fullscreen dark view with sidebar, data, and ACCUSE button
*/

const ROUND_NAME = ROUND_NAMES.ROUND5;
const STAGES = { SELECTION: 'selection', EXPLORER: 'explorer', VIEWER: 'viewer' };

export default function Round5({ playerId, sessionId, onComplete }) {
  const [stage, setStage] = useState(STAGES.SELECTION);
  const [selectedCrewmate, setCrewmate] = useState(null);
  const [selectedFolder, setFolder] = useState(null);

  // Start the round timer once, on mount
  useEffect(() => {
    startRoundTimer(ROUND_NAME);
  }, []);

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

  // Called by FolderViewer's ShipSavedScreen "CONTINUE MISSION" button
  const handleRoundComplete = useCallback(async () => {
    try {
      const timeTaken = endRoundTimer(ROUND_NAME);
      await submitRoundScore(playerId, sessionId, {
        score: 10,
        round: ROUND_NAME,
        time_taken_secs: timeTaken,
        role: 'crewmate',
        survived: true,
      });
      markRoundComplete(ROUND_NAME);
      onComplete?.({ score: 10, timeTaken });
    } catch (e) {
      console.error('Round 5 submit error:', e);
      // Still advance even if submit fails so the player isn't blocked
      onComplete?.({ score: 0 });
    }
  }, [playerId, sessionId, onComplete]);

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
      onRoundComplete={handleRoundComplete}
    />
  );
}