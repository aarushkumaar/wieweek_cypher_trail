import RoundGuidelines from './RoundGuidelines';

export default function Round3T({ onStart }) {
    return (
        <RoundGuidelines
            roundNum={3}
            label="TASK"
            title="BENEATH THE INTERFACE"
            accent="#c51111"
            icon="☣"
            description={
                <>
                    The sabotage wasn't hidden inside the files.
                    <br />
                    It was hidden beneath the interface itself.
                    <br /><br />
                    ⚠ HIDDEN SYSTEM DATA DETECTED
                    <br />
                    Visible files are clean.
                    <br />
                    The real evidence has been concealed inside this terminal's source.
                    <br />
                    Inspect the page source.
                    <br />
                    Recover every hidden fragment.
                    <br />
                    Assemble the final access code.
                    <br />
                    Only then will the security firewall unlock.
                    <br /><br />
                    — ARIA
                </>
            }
            onStart={onStart}
        />
    );
}
