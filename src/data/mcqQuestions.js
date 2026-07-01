/**
 * src/data/mcqQuestions.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Round 1 — Mission Clearance question bank.
 *
 * Each question: { q, opts: [4 strings], ans: <index of correct option> }
 *
 * buildRound1Questions() randomly samples a configurable number of questions
 * from each category, tags them with category metadata (used for the badge
 * UI in some Round 1 variants), shuffles categories together, and returns
 * a combined 20-question set. Call it fresh each round for a new shuffle.
 */

// ── Aptitude ────────────────────────────────────────────────────────────────
const APTITUDE_QUESTIONS = [
    {
        q: "Six engineers—A, B, C, D, E, and F—are available for a reactor maintenance shift. A team of 4 engineers must be selected. A refuses to work with B or C. D and E must always be assigned together. F can only be assigned if A or B is also assigned. How many valid 4-engineer teams can be formed?",
        opts: ["2", "3", "4", "5"],
        ans: 1,
    },
    {
        q: "A drone starts at (0,0) facing North. It follows this sequence: Forward 3 → Right → Forward 2 → Left → Forward 1 → Right → Backward 2 → Left → Forward 4 → Right. Where does the drone end?",
        opts: ["(2,6)", "(4,4)", "(3,5)", "(0,8)"],
        ans: 3,
    },
    {
        q: "A docking code consists of 5 distinct digits chosen from 1–9. The digits must always appear in strictly increasing order. How many different docking codes are possible?",
        opts: ["84", "126", "252", "720"],
        ans: 1,
    },
    {
        q: "A packet travels through four independent gateways. Gateway A succeeds with probability 0.9, Gateway B with 0.8, Gateway C with 0.7, and Gateway D with 0.6. The packet succeeds only if Gateway A succeeds and at least two of Gateways B, C, and D also succeed. What is the probability of successful delivery?",
        opts: ["0.6092", "0.7092", "0.7880", "0.9000"],
        ans: 1,
    },
    {
        q: "An AI allocates memory according to the sequence: 2, 5, 12, 27, 58, ? What is the next term?",
        opts: ["119", "120", "121", "122"],
        ans: 2,
    },
    {
        q: "Five crew members—A, B, C, D, and E—must stand in a line. A and B cannot stand next to each other. C must stand before D. E must stand at one of the two ends. How many valid arrangements are possible?",
        opts: ["10", "12", "16", "24"],
        ans: 1,
    },
    {
        q: "Find the next number in the sequence: 4, 9, 19, 39, 79, ?",
        opts: ["156", "158", "159", "161"],
        ans: 2,
    },
    {
        q: "Six crew members—A, B, C, D, E, and F—are suspects. Exactly one is the Impostor. F is not the Impostor. B is innocent. Exactly one of B and E is the Impostor. If A is the Impostor, then B is innocent. If C is innocent, then D is innocent. Who must be the Impostor?",
        opts: ["A", "C", "D", "E"],
        ans: 3,
    },
    {
        q: "You have 27 identical-looking batteries, but one battery is heavier than the others. Using only a balance scale, what is the minimum number of weighings required to guarantee finding the heavier battery?",
        opts: ["2", "3", "4", "5"],
        ans: 1,
    },
    {
        q: "The Security AI computes a key from the array [10, 20, 30, 40]. The key is defined as: (XOR of all array elements) + (number of set bits in the XOR result). What is the resulting key?",
        opts: ["36", "39", "42", "45"],
        ans: 2,
    },
];

// ── Logic ───────────────────────────────────────────────────────────────────
const LOGIC_QUESTIONS = [
    {
        q: "Four players (Red, Blue, Green, Yellow) are in Electrical. Exactly one is the Impostor. Red says: \"Yellow is the Impostor.\" Blue says: \"Red is lying.\" Green says: \"I am not the Impostor.\" Yellow says: \"Blue is the Impostor.\" If only one player is telling the truth, who is the Impostor?",
        opts: ["Red", "Blue", "Green", "Yellow"],
        ans: 2,
    },
    {
        q: "You are debugging the Reactor Meltdown task. Four lines of code must be executed. If Line 1 is run, Line 3 must be run immediately after. Line 2 cannot be run before Line 4. Line 4 must be the first line executed. Line 1 cannot be the last. What is the only valid sequence of execution?",
        opts: ["2–1–3–4", "4–2–1–3", "1–3–2–4", "4–1–3–2"],
        ans: 3,
    },
    {
        q: "A security log shows a sequence of sabotages: 0, 1, 1, 2, 4, 8, 13, 24, 44, ... What is the next number?",
        opts: ["81", "76", "80", "88"],
        ans: 0,
    },
    {
        q: "Enter the passcode based on this logic: 680 = 4, 902 = 2, 816 = 3, 135 = 0, 987 = ?",
        opts: ["3", "4", "2", "1"],
        ans: 0,
    },
    {
        q: "Three Crewmates (A, B, C) are suspected of venting. If A vented, B is the Impostor. If B is the Impostor, C is innocent. If C is innocent, then A did not vent. If these premises are all true, which of the following is logically impossible?",
        opts: ["A vented", "C is innocent", "B is the Impostor", "All are possible"],
        ans: 0,
    },
    {
        q: "Four crewmates (Cyan, Pink, Orange, Purple) were near MedBay when a sabotage happened. Exactly one is the Impostor. Cyan says: \"Orange is innocent.\" Pink says: \"Purple is the Impostor.\" Orange says: \"Cyan is telling the truth.\" Purple says: \"Pink is lying.\" If exactly three of them are telling the truth, who is the Impostor?",
        opts: ["Cyan", "Pink", "Orange", "Purple"],
        ans: 3,
    },
    {
        q: "Data packet sizes arriving at the terminal follow this pattern: 2, 3, 7, 16, 32, 57, ... What is the next packet size?",
        opts: ["82", "93", "89", "91"],
        ans: 1,
    },
    {
        q: "You need to route power through four nodes (A, B, C, D). Power cannot flow to node B unless it has already passed through node D. Node C must be activated immediately after node A. Node B cannot be the first node. Node D cannot be the first node. What is the only valid sequence?",
        opts: ["A–C–D–B", "D–B–A–C", "A–D–C–B", "D–A–C–B"],
        ans: 0,
    },
    {
        q: "Decode the keypad: 712 = 14, 823 = 48, 952 = 90, 534 = 60, 624 = ?",
        opts: ["24", "48", "36", "12"],
        ans: 1,
    },
    {
        q: "Three crewmates (White, Black, Brown) are reviewing the ship's navigation course. If White altered the course, then Black is tracking it. If Black is tracking it, then Brown is distracted. If Brown is distracted, then White did not alter the course. If all the statements above are true, which scenario is completely impossible?",
        opts: ["Black is tracking it", "Brown is distracted", "White altered the course", "None of the above"],
        ans: 2,
    },
];

// ── Tech ────────────────────────────────────────────────────────────────────
const TECH_QUESTIONS = [
    {
        q: "What is the output of the following postfix expression evaluated using a stack? 8 2 3 ^ / 2 3 * + 5 1 * −",
        opts: ["1", "2", "5", "7"],
        ans: 1,
    },
    {
        q: "A Boolean expression F = AB' + A'B + ABC simplifies to:",
        opts: ["A⊕B", "A+B", "AB'+A'B+C", "A⊕B+ABC"],
        ans: 3,
    },
    {
        q: "A binary search algorithm is mistakenly implemented so that it reduces the search space by one-third in every iteration instead of half. What is its time complexity?",
        opts: ["O(n)", "O(log₃ n)", "O(log n)", "O(√n)"],
        ans: 2,
    },
    {
        q: "Which layer of the OSI model is responsible for end-to-end communication?",
        opts: ["Network", "Data Link", "Transport", "Physical"],
        ans: 2,
    },
    {
        q: "In C++, what is a dangling pointer vs a null pointer?",
        opts: [
            "Both cause the same error",
            "A null pointer points to address 0 (safe to check); a dangling pointer points to memory that has already been freed — accessing it is undefined behavior",
            "Dangling pointers only occur with arrays",
            "Null pointers crash programs; dangling pointers are safe",
        ],
        ans: 1,
    },
    {
        q: "Which algorithm has the best worst-case time complexity for sorting?",
        opts: ["Bubble Sort", "Quick Sort", "Merge Sort", "Insertion Sort"],
        ans: 2,
    },
    {
        q: "Which page replacement algorithm can exhibit Belady's Anomaly?",
        opts: ["FIFO", "LRU", "Optimal", "Clock"],
        ans: 0,
    },
    {
        q: "Which protocol operates at the Transport Layer?",
        opts: ["IP", "TCP", "Ethernet", "ARP"],
        ans: 1,
    },
    {
        q: "Which traversal of a Binary Search Tree always gives sorted output?",
        opts: ["Preorder", "Postorder", "Inorder", "Level Order"],
        ans: 2,
    },
    {
        q: "Which algorithm is primarily used for dimensionality reduction?",
        opts: ["K-Means", "PCA", "Naïve Bayes", "Random Forest"],
        ans: 1,
    },
    {
        q: "Which of the following cannot be assigned to a host on a typical IPv4 network?",
        opts: ["192.168.1.0", "192.168.1.10", "192.168.1.254", "10.10.10.10"],
        ans: 0,
    },
    {
        q: "What is the output?\na = [10, 20, 30]\nb = a\nb.append(40)\nprint(len(a))",
        opts: ["3", "4", "Error", "1"],
        ans: 1,
    },
    {
        q: "What is the output?\nint x = 5;\nSystem.out.println(x++ + ++x);",
        opts: ["10", "11", "12", "13"],
        ans: 2,
    },
    {
        q: "Which query returns the second-highest salary?",
        opts: [
            "SELECT MAX(salary) FROM Employee;",
            "SELECT MIN(salary) FROM Employee;",
            "SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);",
            "SELECT salary FROM Employee;",
        ],
        ans: 2,
    },
    {
        q: "What is the worst-case time complexity of inserting an element into the middle of an array?",
        opts: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        ans: 2,
    },
    {
        q: "What is the output?\nint a = 3;\nprintf(\"%d\", a << 2);",
        opts: ["6", "8", "12", "16"],
        ans: 2,
    },
    {
        q: "Which protocol is responsible for translating a domain name into an IP address?",
        opts: ["DHCP", "DNS", "FTP", "SMTP"],
        ans: 1,
    },
    {
        q: "What is the output?\nx = [1, 2]\ny = x\nx = x + [3]\nprint(len(y))",
        opts: ["2", "3", "4", "Error"],
        ans: 0,
    },
    {
        q: "What does CRUD stand for?",
        opts: [
            "Create, Read, Update, Delete",
            "Create, Run, Update, Deploy",
            "Copy, Read, Undo, Delete",
            "Create, Remove, Upload, Download",
        ],
        ans: 0,
    },
    {
        q: "Which scheduling algorithm may lead to starvation?",
        opts: ["FCFS", "Round Robin", "Shortest Job First (Non-preemptive)", "Priority Scheduling"],
        ans: 3,
    },
    {
        q: "What is the output?\nint a = 5;\nint b = 2;\nprintf(\"%d\", a / b);",
        opts: ["2.5", "2", "3", "Error"],
        ans: 1,
    },
    {
        q: "Which of the following is not an ACID property?",
        opts: ["Atomicity", "Consistency", "Isolation", "Distribution"],
        ans: 3,
    },
    {
        q: "How many set bits are present in 45?",
        opts: ["3", "4", "5", "6"],
        ans: 1,
    },
];

// ── Category metadata (used for badge color/icon in some Round 1 UIs) ───────
const CATEGORY_META = {
    APTITUDE: { label: "Aptitude", color: "#ffaa00", icon: "🧮" },
    LOGIC: { label: "Logic", color: "#38fedc", icon: "🧠" },
    TECH: { label: "Tech", color: "#39ff14", icon: "💻" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function tagCategory(list, key) {
    const meta = CATEGORY_META[key];
    return list.map((item) => ({
        ...item,
        category: meta.label,
        categoryColor: meta.color,
        categoryIcon: meta.icon,
    }));
}

/**
 * Builds the Round 1 question set.
 *
 * Randomly samples `aptitude` / `logic` / `tech` questions (no repeats)
 * from each category pool, tags them with category metadata, and shuffles
 * the combined set so categories are interleaved rather than blocked.
 *
 * Default split: 7 Aptitude + 7 Logic + 6 Tech = 20 questions.
 * Pass a custom split if you want a different total or weighting, e.g.
 *   buildRound1Questions({ aptitude: 10, logic: 10, tech: 23 }) // use everything
 */
export function buildRound1Questions({ aptitude = 7, logic = 7, tech = 6 } = {}) {
    const pickedAptitude = shuffle(APTITUDE_QUESTIONS).slice(0, aptitude);
    const pickedLogic = shuffle(LOGIC_QUESTIONS).slice(0, logic);
    const pickedTech = shuffle(TECH_QUESTIONS).slice(0, tech);

    const combined = [
        ...tagCategory(pickedAptitude, "APTITUDE"),
        ...tagCategory(pickedLogic, "LOGIC"),
        ...tagCategory(pickedTech, "TECH"),
    ];

    return shuffle(combined);
}

// Exported in case you want direct access to the raw pools elsewhere
export { APTITUDE_QUESTIONS, LOGIC_QUESTIONS, TECH_QUESTIONS };