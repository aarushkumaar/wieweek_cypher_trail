/**
 * api.js — WIE Week Game API
 *
 * MOCK_MODE = true  → returns local data instantly (no network)
 * MOCK_MODE = false → hits the real backend endpoints (fill BASE_URL below)
 *
 * Exports:
 *   getRound1Questions()  → Promise<Question[]>
 *   getRound2Modules()    → Promise<Module[]>
 */

// ─── Config ────────────────────────────────────────────────────────────────
export const MOCK_MODE = true;
const BASE_URL = 'https://your-backend.example.com/api'; // swap when ready

// ─── Round 1 — MCQ Questions ───────────────────────────────────────────────
/**
 * @typedef {{ q: string, opts: string[], ans: number }} R1Question
 * ans is the 0-based index of the correct option.
 */
const MOCK_ROUND1_QUESTIONS = [
    { q: 'What is the capital of France?', opts: ['Berlin', 'Paris', 'Madrid', 'Rome'], ans: 1 },
    { q: 'Which planet is known as the Red Planet?', opts: ['Venus', 'Jupiter', 'Mars', 'Saturn'], ans: 2 },
    { q: 'What does CPU stand for?', opts: ['Central Process Unit', 'Central Processing Unit', 'Computer Personal Unit', 'Core Processing Unit'], ans: 1 },
    { q: 'Which data structure follows LIFO order?', opts: ['Queue', 'Stack', 'Tree', 'Graph'], ans: 1 },
    { q: 'Who invented the World Wide Web?', opts: ['Bill Gates', 'Steve Jobs', 'Tim Berners-Lee', 'Linus Torvalds'], ans: 2 },
    { q: 'What is 2 raised to the power of 10?', opts: ['20', '1024', '512', '2048'], ans: 1 },
    { q: 'Which protocol is used for secure web browsing?', opts: ['HTTP', 'FTP', 'HTTPS', 'SMTP'], ans: 2 },
    { q: 'Time complexity of binary search?', opts: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], ans: 2 },
    { q: 'Which HTML tag creates the largest heading?', opts: ['<h6>', '<heading>', '<h1>', '<head>'], ans: 2 },
    { q: 'Which company developed the Android OS?', opts: ['Apple', 'Microsoft', 'Samsung', 'Google'], ans: 3 },
    { q: 'What does RAM stand for?', opts: ['Read Access Memory', 'Random Access Memory', 'Rapid Access Module', 'Runtime Allocated Memory'], ans: 1 },
    { q: 'Which language is used for styling web pages?', opts: ['HTML', 'JavaScript', 'CSS', 'Python'], ans: 2 },
    { q: 'What is the value of π to 2 decimal places?', opts: ['3.12', '3.14', '3.16', '3.18'], ans: 1 },
    { q: 'Which sorting algorithm has best average O(n log n)?', opts: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Selection Sort'], ans: 2 },
    { q: 'What does IoT stand for?', opts: ['Internet of Things', 'Internet of Technology', 'Integration of Things', 'Interface of Things'], ans: 0 },
    { q: 'Which gate outputs 1 only when both inputs are 1?', opts: ['OR', 'NOT', 'AND', 'XOR'], ans: 2 },
    { q: 'Binary representation of decimal 10?', opts: ['1010', '1001', '1100', '0110'], ans: 0 },
    { q: 'Which keyword declares a constant in JavaScript?', opts: ['var', 'let', 'const', 'static'], ans: 2 },
    { q: 'What does SQL stand for?', opts: ['Structured Query Language', 'Simple Query Logic', 'Standard Query Language', 'System Query List'], ans: 0 },
    { q: 'Which of these is NOT an OOP concept?', opts: ['Encapsulation', 'Polymorphism', 'Compilation', 'Inheritance'], ans: 2 },
];

// ─── Round 2 — Output Prediction Modules ────────────────────────────────────
// Each question has a single-digit `answer`. The 4 answers form a 4-digit code.
const MOCK_ROUND2_MODULES = [
    {
        id: 1, lang: 'C++', icon: '⚙', col: '#00b4ff', rgb: '0,180,255',
        questions: [
            { title: 'Q1 — POWER ROUTER', lines: [{ c: 'cm', t: '// What is the output?' }, { t: '' }, { c: 'fn', t: 'int main() {' }, { t: '    int x = 1 + 2;' }, { t: '    cout << x;' }, { t: '}' }], answer: '3' },
            { title: 'Q2 — POWER ROUTER', lines: [{ c: 'cm', t: '// What is the output?' }, { t: '' }, { c: 'fn', t: 'int main() {' }, { t: '    int x = 3;' }, { t: '    x *= 2;' }, { t: '    cout << x;' }, { t: '}' }], answer: '6' },
            { title: 'Q3 — POWER ROUTER', lines: [{ c: 'cm', t: '// What is the output?' }, { t: '' }, { c: 'fn', t: 'int main() {' }, { t: '    cout << 10 / 5;' }, { t: '}' }], answer: '2' },
            { title: 'Q4 — POWER ROUTER', lines: [{ c: 'cm', t: '// What is the output?' }, { t: '' }, { c: 'fn', t: 'int main() {' }, { t: '    int a = 5, b = 3;' }, { t: '    cout << a + b;' }, { t: '}' }], answer: '8' },
        ],
    },
    {
        id: 2, lang: 'C', icon: '⚡', col: '#ff3232', rgb: '255,50,50',
        questions: [
            { title: 'Q1 — CIRCUIT CAL', lines: [{ c: 'cm', t: '/* What is the output? */' }, { t: '' }, { c: 'fn', t: 'int main() {' }, { t: '    printf("%d", 2 * 2);' }, { t: '}' }], answer: '4' },
            { title: 'Q2 — CIRCUIT CAL', lines: [{ c: 'cm', t: '/* What is the output? */' }, { t: '' }, { c: 'fn', t: 'int main() {' }, { t: '    int x = 10;' }, { t: '    printf("%d", x - 3);' }, { t: '}' }], answer: '7' },
            { title: 'Q3 — CIRCUIT CAL', lines: [{ c: 'cm', t: '/* What is the output? */' }, { t: '' }, { c: 'fn', t: 'int main() {' }, { t: '    printf("%d", 5 / 5);' }, { t: '}' }], answer: '1' },
            { title: 'Q4 — CIRCUIT CAL', lines: [{ c: 'cm', t: '/* What is the output? */' }, { t: '' }, { c: 'fn', t: 'int main() {' }, { t: '    int a = 2, b = 3;' }, { t: '    printf("%d", a + b);' }, { t: '}' }], answer: '5' },
        ],
    },
    {
        id: 3, lang: 'PYTHON', icon: '🐍', col: '#ffa000', rgb: '255,160,0',
        questions: [
            { title: 'Q1 — FUSE CTRL', lines: [{ c: 'cm', t: '# What is the output?' }, { t: '' }, { t: 'print(2 + 3)' }], answer: '5' },
            { title: 'Q2 — FUSE CTRL', lines: [{ c: 'cm', t: '# What is the output?' }, { t: '' }, { t: 'x = 6 // 2' }, { t: 'print(x)' }], answer: '3' },
            { title: 'Q3 — FUSE CTRL', lines: [{ c: 'cm', t: '# What is the output?' }, { t: '' }, { t: 'print(3 ** 2)' }], answer: '9' },
            { title: 'Q4 — FUSE CTRL', lines: [{ c: 'cm', t: '# What is the output?' }, { t: '' }, { t: 'print(8 - 6)' }], answer: '2' },
        ],
    },
    {
        id: 4, lang: 'JAVA', icon: '☕', col: '#ffcc00', rgb: '255,200,0',
        questions: [
            { title: 'Q1 — POWER DIST', lines: [{ c: 'cm', t: '// What is the output?' }, { t: '' }, { c: 'fn', t: 'public static void main(String[] args) {' }, { t: '    System.out.println(3 + 4);' }, { t: '}' }], answer: '7' },
            { title: 'Q2 — POWER DIST', lines: [{ c: 'cm', t: '// What is the output?' }, { t: '' }, { c: 'fn', t: 'public static void main(String[] args) {' }, { t: '    System.out.println(8 / 2);' }, { t: '}' }], answer: '4' },
            { title: 'Q3 — POWER DIST', lines: [{ c: 'cm', t: '// What is the output?' }, { t: '' }, { c: 'fn', t: 'public static void main(String[] args) {' }, { t: '    int x = 2; x += 4;' }, { t: '    System.out.println(x);' }, { t: '}' }], answer: '6' },
            { title: 'Q4 — POWER DIST', lines: [{ c: 'cm', t: '// What is the output?' }, { t: '' }, { c: 'fn', t: 'public static void main(String[] args) {' }, { t: '    System.out.println(5 - 5);' }, { t: '}' }], answer: '0' },
        ],
    },
];
// ─── API functions ──────────────────────────────────────────────────────────

/**
 * Fetch Round 1 MCQ questions.
 * @returns {Promise<typeof MOCK_ROUND1_QUESTIONS>}
 */
export async function getRound1Questions() {
    if (MOCK_MODE) {
        return structuredClone(MOCK_ROUND1_QUESTIONS);
    }
    const res = await fetch(`${BASE_URL}/round1/questions`);
    if (!res.ok) throw new Error(`Round 1 fetch failed: ${res.status}`);
    return res.json();
}

/**
 * Fetch Round 2 bug-hunt modules (all 4 languages).
 * @returns {Promise<typeof MOCK_ROUND2_MODULES>}
 */
export async function getRound2Modules() {
    if (MOCK_MODE) {
        return structuredClone(MOCK_ROUND2_MODULES);
    }
    const res = await fetch(`${BASE_URL}/round2/modules`);
    if (!res.ok) throw new Error(`Round 2 fetch failed: ${res.status}`);
    return res.json();
}