import RoundGuidelines from './RoundGuidelines';

export default function Round5T({ onStart }) {
    return (
        <RoundGuidelines
            roundNum={5}
            label="TASK"
            title="THE IMPOSTOR FILES"
            accent="#f5f558"
            icon="★"
            description={
                <>
                    Only one task remains.
                    <br />
                    Determine who sabotaged SKELD-9.
                    <br /><br />
                    ⚠ FINAL CREW VERIFICATION
                    <br />
                    Five crew files have been recovered.
                    <br />
                    Every profile contains Task Logs, Personal Records, Messages and Access Logs.
                    <br />
                    One crewmate has repeatedly falsified official records.
                    <br />
                    Compare every document with the Ship Regulations Manual.
                    <br />
                    The crewmate with the greatest number of inconsistencies is the impostor.
                    <br />
                    Choose carefully.
                    <br />
                    There will not be another vote.
                    <br /><br />
                    — ARIA
                </>
            }
            onStart={onStart}
        />
    );
}
