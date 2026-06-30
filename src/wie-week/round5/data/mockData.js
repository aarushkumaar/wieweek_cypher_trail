/* ── Round 5 — SKELD-9 Crew Operations Manual — Mock Data ─────────────────── */

const COLORS = {
  1: '#3ed94e',  // James Carter  — green
  2: '#f17d2a',  // Sarah Mitchell — orange
  3: '#1d9bf0',  // Daniel Brooks  — blue
  4: '#e23636',  // Olivia Bennett — red
  5: '#d9d926',  // Michael Foster — yellow (IMPOSTOR)
};

export const CREWMATES = [
  { id: 1, name: 'James Carter',   displayName: 'James Carter',   role: 'Captain',            color: COLORS[1], suspicious: false },
  { id: 2, name: 'Sarah Mitchell', displayName: 'Sarah Mitchell', role: 'Chief Engineer',      color: COLORS[2], suspicious: false },
  { id: 3, name: 'Daniel Brooks',  displayName: 'Daniel Brooks',  role: 'Navigation Officer',  color: COLORS[3], suspicious: false },
  { id: 4, name: 'Olivia Bennett', displayName: 'Olivia Bennett', role: 'Research Scientist',  color: COLORS[4], suspicious: false },
  { id: 5, name: 'Michael Foster', displayName: 'Michael Foster', role: 'Security Officer',    color: COLORS[5], suspicious: true  },
];

export const FILE_FOLDERS = [
  { key: 'taskHistory',     name: 'Task History',     type: 'File Folder', size: '—', dateModified: '2-06-2026 11:05 PM', openable: true },
  { key: 'personalProfile', name: 'Personal Profile', type: 'File Folder', size: '—', dateModified: '2-06-2026 11:05 PM', openable: true },
  { key: 'messageHistory',  name: 'Message History',  type: 'File Folder', size: '—', dateModified: '2-06-2026 11:05 PM', openable: true },
  { key: 'accessLog',       name: 'Access Log',       type: 'File Folder', size: '—', dateModified: '2-06-2026 11:05 PM', openable: true },
];

/* ═══════════════════════════════════════════════════════════════════════════
   TASK HISTORY
   Fields: { id, task, location, status, date }
   ═══════════════════════════════════════════════════════════════════════════ */
const TASK_HISTORY = {
  // ── James Carter (Captain) ──────────────────────────────────────────────
  1: [
    { id: 'T-101', task: 'Calibrate Navigation System', location: 'Bridge',      status: 'Completed', date: '2026-06-01' },
    { id: 'T-102', task: 'Run Diagnostic on Engines',   location: 'Engine Room', status: 'Completed', date: '2026-06-01' },
    { id: 'T-103', task: 'Submit Crew Roster Report',   location: 'Admin',       status: 'Completed', date: '2026-06-02' },
    { id: 'T-104', task: 'Inspect Shield Generator',    location: 'Shields',     status: 'Pending',   date: '2026-06-02' },
  ],
  // ── Sarah Mitchell (Chief Engineer) ────────────────────────────────────
  2: [
    { id: 'T-201', task: 'Prime Engine Core',     location: 'Engine Room', status: 'Completed', date: '2026-06-01' },
    { id: 'T-202', task: 'Clear Debris from Vents',location: 'Cafeteria',  status: 'Completed', date: '2026-06-01' },
    { id: 'T-203', task: 'Fix Wiring Harness',    location: 'Electrical',  status: 'Completed', date: '2026-06-02' },
    { id: 'T-204', task: 'Divert Power to Shields',location: 'Shields',    status: 'Completed', date: '2026-06-02' },
  ],
  // ── Daniel Brooks (Navigation Officer) ─────────────────────────────────
  3: [
    { id: 'T-301', task: 'Chart Course to Sector 7', location: 'Bridge', status: 'Completed', date: '2026-06-01' },
    { id: 'T-302', task: 'Clean O2 Filters',         location: 'Oxygen', status: 'Pending',   date: '2026-06-01' },
    { id: 'T-303', task: 'Update Star Maps',          location: 'Bridge', status: 'Completed', date: '2026-06-02' },
    { id: 'T-304', task: 'Empty Garbage Chute',       location: 'Oxygen', status: 'Completed', date: '2026-06-02' },
  ],
  // ── Olivia Bennett (Research Scientist) ────────────────────────────────
  4: [
    { id: 'T-401', task: 'Analyze Sample Alpha',        location: 'MedBay',  status: 'Completed', date: '2026-06-01' },
    { id: 'T-402', task: 'Calibrate Specimen Incubator',location: 'MedBay',  status: 'Completed', date: '2026-06-01' },
    { id: 'T-403', task: 'Refill MedBay Supplies',      location: 'MedBay',  status: 'Completed', date: '2026-06-02' },
    { id: 'T-404', task: 'Process Radiation Scans',     location: 'Weapons', status: 'Pending',   date: '2026-06-02' },
  ],
  // ── Michael Foster (Security Officer) — IMPOSTOR ───────────────────────
  // Breach 1: Reactor entry at 23:40 (past curfew) with ZERO reactor tasks
  // Breach 2: ID SEC-5503 → digits 5+5+0+3 = 13, outside 10–12 bracket
  // Breach 3: Message claims "Security Room" view — logs place him in Reactor
  5: [
    { id: 'T-501', task: 'Review Security Footage', location: 'Security',     status: 'Completed', date: '2026-06-01' },
    { id: 'T-502', task: 'Calibrate Weapon Cannons',location: 'Weapons',      status: 'Completed', date: '2026-06-01' },
    { id: 'T-503', task: 'Test Bulkhead Doors',     location: 'Lower Engine', status: 'Completed', date: '2026-06-02' },
    { id: 'T-504', task: 'Reset Security Firewalls',location: 'Security',     status: 'Completed', date: '2026-06-02' },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
   PERSONAL PROFILES
   Fields used by PersonalProfileView:
     crewId, role, certification, department, experience, bloodType, gender,
     rank, dateJoined, homePlanet, certSuspicious,
     level, xp, maxXp, rating, ratingPct,
     gameStats: { gamesPlayed, wins, tasksCompleted }
   ═══════════════════════════════════════════════════════════════════════════ */
const PERSONAL_PROFILES = {
  // ── James Carter ──────────────────────────────────────────────────────
  1: {
    crewId: 'CAP-8842', role: 'Captain', rank: 'Captain',
    certification: 'Level 5 (All-Access)',
    department: 'Command', experience: '14 Years',
    dateJoined: '2012-03-15', homePlanet: 'Earth',
    bloodType: 'O+', gender: 'Male',
    assignedQuarters: 'Cabin A-1',
    // ID digit sum: 8+8+4+2 = 22  — outside 10-12 bracket but James is NOT the impostor (distraction for digit-only IDs)
    level: 14, xp: 1260, maxXp: 2000, rating: 1000, ratingPct: 'TOP 50%',
    gameStats: { gamesPlayed: 142, wins: 98, tasksCompleted: 1847 },
    certSuspicious: false,
  },
  // ── Sarah Mitchell ────────────────────────────────────────────────────
  2: {
    crewId: 'ENG-4419', role: 'Chief Engineer', rank: 'Chief Engineer',
    certification: 'Level 4',
    department: 'Engineering', experience: '11 Years',
    dateJoined: '2015-07-22', homePlanet: 'Luna Colony',
    bloodType: 'A-', gender: 'Female',
    assignedQuarters: 'Cabin B-3',
    // ID digit sum: 4+4+1+9 = 18 — outside bracket (distraction)
    level: 11, xp: 920, maxXp: 1500, rating: 880, ratingPct: 'TOP 60%',
    gameStats: { gamesPlayed: 110, wins: 72, tasksCompleted: 1350 },
    certSuspicious: false,
  },
  // ── Daniel Brooks ─────────────────────────────────────────────────────
  3: {
    crewId: 'NAV-1092', role: 'Navigation Officer', rank: 'Navigation Officer',
    certification: 'Level 3',
    department: 'Navigation', experience: '8 Years',
    dateJoined: '2018-01-10', homePlanet: 'Mars Base',
    bloodType: 'B+', gender: 'Male',
    assignedQuarters: 'Cabin C-2',
    // ID digit sum: 1+0+9+2 = 12 — within 10-12 (clean)
    level: 8, xp: 1100, maxXp: 1800, rating: 950, ratingPct: 'TOP 55%',
    gameStats: { gamesPlayed: 128, wins: 85, tasksCompleted: 1620 },
    certSuspicious: false,
  },
  // ── Olivia Bennett ────────────────────────────────────────────────────
  4: {
    crewId: 'SCI-7721', role: 'Research Scientist', rank: 'Research Scientist',
    certification: 'Level 3',
    department: 'Research', experience: '6 Years',
    dateJoined: '2020-05-18', homePlanet: 'Earth',
    bloodType: 'AB-', gender: 'Female',
    assignedQuarters: 'Cabin D-4',
    // ID digit sum: 7+7+2+1 = 17 — outside bracket (distraction)
    level: 6, xp: 450, maxXp: 1000, rating: 320, ratingPct: 'TOP 90%',
    gameStats: { gamesPlayed: 34, wins: 31, tasksCompleted: 98 },
    certSuspicious: false,
  },
  // ── Michael Foster — IMPOSTOR ─────────────────────────────────────────
  5: {
    crewId: 'SEC-5503', role: 'Security Officer', rank: 'Security Officer',
    certification: 'Level 4',
    department: 'Security', experience: '9 Years',
    dateJoined: '2017-09-03', homePlanet: 'Earth',
    bloodType: 'O-', gender: 'Male',
    assignedQuarters: 'Cabin E-1',
    // ⚠ Rule 3 BREACH: digit sum 5+5+0+3 = 13 — outside 10-12 bracket
    level: 9, xp: 780, maxXp: 1400, rating: 820, ratingPct: 'TOP 62%',
    gameStats: { gamesPlayed: 96, wins: 63, tasksCompleted: 1180 },
    certSuspicious: true,  // triggers red highlight in PersonalProfileView
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   MESSAGE HISTORY
   Structure:
     conversations : [{ contactId, contactName, lastMsg, time }]
     chatMessages  : { contactId: [{ sender, text, time, self?, suspicious? }] }
   ═══════════════════════════════════════════════════════════════════════════ */
const MESSAGE_HISTORY = {

  // ── James Carter (1) ──────────────────────────────────────────────────
  1: {
    conversations: [
      { contactId: 2, contactName: 'Sarah Mitchell', lastMsg: 'Logs sent. Engine 2 running hot.',   time: '04:12' },
      { contactId: 3, contactName: 'Daniel Brooks',  lastMsg: 'Maintain current trajectory.',       time: '06:30' },
    ],
    chatMessages: {
      2: [
        { sender: 'James',  time: '04:00', text: 'Need the engine efficiency metrics by 0400 hours.', self: true },
        { sender: 'Sarah',  time: '04:12', text: 'Logs sent. Engine 2 is running hot, keeping an eye on it.' },
      ],
      3: [
        { sender: 'James',  time: '06:28', text: 'Maintain current trajectory. The storm is clearing up.', self: true },
        { sender: 'Daniel', time: '06:30', text: 'Course locked. ETA to destination is 48 hours.' },
      ],
    },
  },

  // ── Sarah Mitchell (2) ────────────────────────────────────────────────
  2: {
    conversations: [
      { contactId: 1, contactName: 'James Carter',   lastMsg: 'Need engine metrics by 0400.',         time: '04:00' },
      { contactId: 5, contactName: 'Michael Foster', lastMsg: 'Looks completely normal from here.',   time: '23:42' },
    ],
    chatMessages: {
      1: [
        { sender: 'James',   time: '04:00', text: 'Need the engine efficiency metrics by 0400 hours.' },
        { sender: 'Sarah',   time: '04:12', text: 'Logs sent. Engine 2 is running hot, keeping an eye on it.', self: true },
      ],
      5: [
        // ⚠ Rule 4 BREACH: Michael claims to be watching cameras ("from here")
        //   but his Access Log shows he physically entered the Reactor at 23:40.
        { sender: 'Sarah',   time: '23:41', text: 'Can you check the security feed near the reactor? Heard a weird noise.' },
        { sender: 'Michael', time: '23:42', text: 'Checked the reactor feed. Everything looks completely normal from here.', suspicious: true },
      ],
    },
  },

  // ── Daniel Brooks (3) ─────────────────────────────────────────────────
  3: {
    conversations: [
      { contactId: 1, contactName: 'James Carter',   lastMsg: 'Course locked. ETA 48 hours.',        time: '06:30' },
      { contactId: 4, contactName: 'Olivia Bennett', lastMsg: 'Did you leave samples on the Bridge?', time: '14:05' },
    ],
    chatMessages: {
      1: [
        { sender: 'James',  time: '06:28', text: 'Maintain current trajectory. The storm is clearing up.' },
        { sender: 'Daniel', time: '06:30', text: 'Course locked. ETA to destination is 48 hours.', self: true },
      ],
      4: [
        { sender: 'Daniel', time: '14:05', text: 'Did you leave your sample containers in the Bridge?', self: true },
        { sender: 'Olivia', time: '14:07', text: "No, those aren't mine. I haven't left the lab all day." },
      ],
    },
  },

  // ── Olivia Bennett (4) ────────────────────────────────────────────────
  4: {
    conversations: [
      { contactId: 3, contactName: 'Daniel Brooks',  lastMsg: "No, those aren't mine.",              time: '14:07' },
      { contactId: 5, contactName: 'Michael Foster', lastMsg: 'Let me know when ready.',             time: '15:10' },
    ],
    chatMessages: {
      3: [
        { sender: 'Daniel', time: '14:05', text: 'Did you leave your sample containers in the Bridge?' },
        { sender: 'Olivia', time: '14:07', text: "No, those aren't mine. I haven't left the lab all day.", self: true },
      ],
      5: [
        { sender: 'Olivia', time: '15:08', text: 'Need a security escort to Weapons later to check the sensors.', self: true },
        { sender: 'Michael',time: '15:10', text: "Sure, let me know when you're ready to head over to Weapons." },
      ],
    },
  },

  // ── Michael Foster (5) — IMPOSTOR ─────────────────────────────────────
  5: {
    conversations: [
      { contactId: 2, contactName: 'Sarah Mitchell', lastMsg: 'Looks completely normal from here.', time: '23:42' },
      { contactId: 4, contactName: 'Olivia Bennett', lastMsg: "Sure, let me know when ready.",      time: '15:10' },
    ],
    chatMessages: {
      2: [
        { sender: 'Sarah',   time: '23:41', text: 'Can you check the security feed near the reactor? Heard a weird noise.' },
        // ⚠ Rule 4 BREACH: claims to be "from here" (Security/camera room)
        //   but Access Log shows Reactor Entry at 23:40 — he is IN the reactor.
        { sender: 'Michael', time: '23:42', text: 'Checked the reactor feed. Everything looks completely normal from here.', self: true, suspicious: true },
      ],
      4: [
        { sender: 'Olivia',  time: '15:08', text: 'Need a security escort to Weapons later to check the sensors.' },
        { sender: 'Michael', time: '15:10', text: "Sure, let me know when you're ready to head over to Weapons.", self: true },
      ],
    },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   ACCESS LOGS
   Fields: { timestamp, action, location, detail, level, suspicious? }
   level: 'INFO' | 'WARNING'
   ═══════════════════════════════════════════════════════════════════════════ */
const ACCESS_LOGS = {
  // ── James Carter ─────────────────────────────────────────────────────
  // Minor distraction: T-102 (Engine Room) has no matching log entry (lazy paperwork)
  1: [
    { timestamp: '2026-06-01 08:30', action: 'ENTRY', location: 'Bridge', detail: 'Granted', level: 'INFO' },
    { timestamp: '2026-06-02 14:15', action: 'ENTRY', location: 'Admin',  detail: 'Granted', level: 'INFO' },
  ],
  // ── Sarah Mitchell ───────────────────────────────────────────────────
  // Minor: entered Electrical at 23:45 (past curfew) — but Electrical is NOT restricted
  2: [
    { timestamp: '2026-06-01 09:00', action: 'ENTRY', location: 'Engine Room', detail: 'Granted', level: 'INFO' },
    { timestamp: '2026-06-02 23:45', action: 'ENTRY', location: 'Electrical',  detail: 'Granted', level: 'INFO' },
  ],
  // ── Daniel Brooks ────────────────────────────────────────────────────
  3: [
    { timestamp: '2026-06-01 08:15', action: 'ENTRY', location: 'Bridge', detail: 'Granted', level: 'INFO' },
    { timestamp: '2026-06-02 11:00', action: 'ENTRY', location: 'Bridge', detail: 'Granted', level: 'INFO' },
  ],
  // ── Olivia Bennett ───────────────────────────────────────────────────
  4: [
    { timestamp: '2026-06-01 10:00', action: 'ENTRY', location: 'MedBay', detail: 'Granted', level: 'INFO' },
    { timestamp: '2026-06-02 13:20', action: 'ENTRY', location: 'MedBay', detail: 'Granted', level: 'INFO' },
  ],
  // ── Michael Foster — IMPOSTOR ─────────────────────────────────────────
  // ⚠ Breach 1 (Rules 1 & 2): Reactor at 23:40 — past curfew + zero reactor tasks
  5: [
    { timestamp: '2026-06-01 11:15', action: 'ENTRY', location: 'Security', detail: 'Granted', level: 'INFO' },
    // CRITICAL: Reactor entry past 23:00 with NO task assignment for Reactor
    { timestamp: '2026-06-02 23:40', action: 'ENTRY', location: 'Reactor',  detail: 'Granted', level: 'WARNING', suspicious: true },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
   SHIP REGULATIONS — SKELD-9 CREW OPERATIONS MANUAL
   Displayed in the Ship Regulations tab (rulebook players use to solve puzzle)
   ═══════════════════════════════════════════════════════════════════════════ */
export const SHIP_REGULATIONS = [
  'Rule 1 — Curfew & Restricted Sectors: Entering highly volatile zones like the Engine Room or the Reactor past 23:00 hours is prohibited without an active maintenance task or an accompanying security escort.',
  'Rule 2 — Task-Log Alignment: If a crewmate\'s Access Log shows they physically entered a room, they must have a corresponding assignment in Task History for that area, or explicit text proof in Message History explaining why they were dispatched there.',
  'Rule 3 — Database ID Checksum Verification: To prevent system spoofing, the numerical digits in all Employee IDs must add up to an even sum total between 10 and 12. Any sum outside this bracket indicates a modified profile.',
  'Rule 4 — Digital Alibi Rule: Statements regarding current locations or ongoing tasks made within Message History must align with the physical coordinates in the Access Log.',
];

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC DATA GETTERS
   ═══════════════════════════════════════════════════════════════════════════ */
export function getTaskHistory(crewmateId)    { return TASK_HISTORY[crewmateId]      ?? []; }
export function getPersonalProfile(crewmateId){ return PERSONAL_PROFILES[crewmateId] ?? {}; }
export function getMessageHistory(crewmateId) { return MESSAGE_HISTORY[crewmateId]   ?? { conversations: [], chatMessages: {} }; }
export function getAccessLog(crewmateId)      { return ACCESS_LOGS[crewmateId]       ?? []; }
