import RoundGuidelines from './RoundGuidelines';

export default function Round2T({ onStart }) {
    return (
        <RoundGuidelines
            roundNum={2}
            label="TASK"
            title="ANOMALY DETECTION"
            accent="#ff6b35"
            icon="⚠"
            description={
                <>
                    Engineering files reveal that several critical software modules were deliberately modified before the sabotage.
                    <br /><br />
                    Only by locating every anomaly can ARIA restore control of the ship.
                    <br /><br />
                    ⚠ SYSTEM CORRUPTION DETECTED
                    <br />
                    FOUR software modules contain hidden anomalies.
                    <br />
                    Every bug was intentionally planted to prevent system recovery.
                    <br />
                    Identify the incorrect line and explain the anomaly.
                    <br />
                    Repair every module to continue.
                    <br /><br />
                    — ARIA
                </>
            }
            onStart={onStart}
        />
    );
}
