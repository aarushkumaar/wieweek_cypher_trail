import RoundGuidelines from './RoundGuidelines';

export default function Round1T({ onStart }) {
    return (
        <RoundGuidelines
            roundNum={1}
            label="TASK"
            title="MISSION CLEARANCE"
            accent="#3a8fc7"
            icon="⬡"
            description={'"Analyst. Before you board SKELD-9, you must clear the Bureau\'s Level-1 Competency Test. No exceptions. Fifteen questions. Three domains — Technology, Logic and Aptitude. Choose your answers carefully — no going back. Your score will be recorded. The ship won\'t wait. Begin." — ARIA, SKELD-9'}
            onStart={onStart}
        />
    );
}
