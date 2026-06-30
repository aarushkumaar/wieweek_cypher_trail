import RoundGuidelines from './RoundGuidelines';

export default function Round4T({ onStart }) {
    return (
        <RoundGuidelines
            roundNum={4}
            label="TASK"
            title="DECODE THE ECHO"
            accent="#ed54ba"
            icon="◉"
            description={
                <>
                    The distress beacon was destroyed.
                    <br />
                    Its QR transmission was scattered throughout the ship before communications failed.
                    <br /><br />
                    ⚠ DISTRESS BEACON OFFLINE
                    <br />
                    Search every accessible section of SKELD-9.
                    <br />
                    Recover every QR fragment.
                    <br />
                    Reconstruct the emergency beacon.
                    <br />
                    Scan the completed code.
                    <br />
                    The recovered transmission has been encrypted by reversing its audio.
                    <br />
                    Decode the message.
                    <br />
                    Extract the emergency vault code.
                    <br />
                    Continue the mission.
                    <br /><br />
                    — ARIA
                </>
            }
            onStart={onStart}
        />
    );
}