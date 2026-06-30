/**
 * src/data/codingQuestions.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Round 2 – Anomaly Detection question bank.
 *
 * Structure: 4 languages × 4 questions. Player picks one language.
 * The 4 single-digit answers concatenate to form the passcode.
 *
 * `lines` array format:
 *   { t: 'text content', c?: 'cm' | 'fn' }
 *   c = 'cm' → renders as a comment (dim colour)
 *   c = 'fn' → renders as a function/keyword (accent colour)
 *   no c     → plain code text
 */

export const CODING_LANGUAGES = [
  // ── C++ ──────────────────────────────────────────────────────────────────
  {
    id: 'cpp',
    lang: 'C++',
    icon: '⚙️',
    color: '#00b4ff',
    rgb: '0,180,255',
    taskName: 'POWER ROUTER',
    questions: [
      {
        title: 'Q1 — POWER ROUTER',
        lines: [
          { c: 'cm', t: '// What is the output?' },
          { t: '' },
          { c: 'fn', t: 'int main() {' },
          { t: '    int x = 1 + 2;' },
          { t: '    cout << x;' },
          { t: '}' },
        ],
        answer: '3',
      },
      {
        title: 'Q2 — POWER ROUTER',
        lines: [
          { c: 'cm', t: '// What is the output?' },
          { t: '' },
          { c: 'fn', t: 'int main() {' },
          { t: '    int x = 3;' },
          { t: '    x *= 2;' },
          { t: '    cout << x;' },
          { t: '}' },
        ],
        answer: '6',
      },
      {
        title: 'Q3 — POWER ROUTER',
        lines: [
          { c: 'cm', t: '// What is the output?' },
          { t: '' },
          { c: 'fn', t: 'int main() {' },
          { t: '    cout << 10 / 5;' },
          { t: '}' },
        ],
        answer: '2',
      },
      {
        title: 'Q4 — POWER ROUTER',
        lines: [
          { c: 'cm', t: '// What is the output?' },
          { t: '' },
          { c: 'fn', t: 'int main() {' },
          { t: '    int a = 5, b = 3;' },
          { t: '    cout << a + b;' },
          { t: '}' },
        ],
        answer: '8',
      },
    ],
  },

  // ── C ────────────────────────────────────────────────────────────────────
  {
    id: 'c',
    lang: 'C',
    icon: '⚡',
    color: '#ff5555',
    rgb: '255,85,85',
    taskName: 'CIRCUIT CAL',
    questions: [
      {
        title: 'Q1 — CIRCUIT CAL',
        lines: [
          { c: 'cm', t: '/* What is the output? */' },
          { t: '' },
          { c: 'fn', t: 'int main() {' },
          { t: '    printf("%d", 2 * 2);' },
          { t: '}' },
        ],
        answer: '4',
      },
      {
        title: 'Q2 — CIRCUIT CAL',
        lines: [
          { c: 'cm', t: '/* What is the output? */' },
          { t: '' },
          { c: 'fn', t: 'int main() {' },
          { t: '    int x = 10;' },
          { t: '    printf("%d", x - 3);' },
          { t: '}' },
        ],
        answer: '7',
      },
      {
        title: 'Q3 — CIRCUIT CAL',
        lines: [
          { c: 'cm', t: '/* What is the output? */' },
          { t: '' },
          { c: 'fn', t: 'int main() {' },
          { t: '    printf("%d", 5 / 5);' },
          { t: '}' },
        ],
        answer: '1',
      },
      {
        title: 'Q4 — CIRCUIT CAL',
        lines: [
          { c: 'cm', t: '/* What is the output? */' },
          { t: '' },
          { c: 'fn', t: 'int main() {' },
          { t: '    int a = 2, b = 3;' },
          { t: '    printf("%d", a + b);' },
          { t: '}' },
        ],
        answer: '5',
      },
    ],
  },

  // ── Python ───────────────────────────────────────────────────────────────
  {
    id: 'python',
    lang: 'Python',
    icon: '🐍',
    color: '#ffa000',
    rgb: '255,160,0',
    taskName: 'FUSE CTRL',
    questions: [
      {
        title: 'Q1 — FUSE CTRL',
        lines: [
          { c: 'cm', t: '# What is the output?' },
          { t: '' },
          { t: 'print(2 + 3)' },
        ],
        answer: '5',
      },
      {
        title: 'Q2 — FUSE CTRL',
        lines: [
          { c: 'cm', t: '# What is the output?' },
          { t: '' },
          { t: 'x = 6 // 2' },
          { t: 'print(x)' },
        ],
        answer: '3',
      },
      {
        title: 'Q3 — FUSE CTRL',
        lines: [
          { c: 'cm', t: '# What is the output?' },
          { t: '' },
          { t: 'print(3 ** 2)' },
        ],
        answer: '9',
      },
      {
        title: 'Q4 — FUSE CTRL',
        lines: [
          { c: 'cm', t: '# What is the output?' },
          { t: '' },
          { t: 'print(8 - 6)' },
        ],
        answer: '2',
      },
    ],
  },

  // ── Java ─────────────────────────────────────────────────────────────────
  {
    id: 'java',
    lang: 'Java',
    icon: '☕',
    color: '#ffcc00',
    rgb: '255,200,0',
    taskName: 'POWER DIST',
    questions: [
      {
        title: 'Q1 — POWER DIST',
        lines: [
          { c: 'cm', t: '// What is the output?' },
          { t: '' },
          { c: 'fn', t: 'public static void main(String[] args) {' },
          { t: '    System.out.println(3 + 4);' },
          { t: '}' },
        ],
        answer: '7',
      },
      {
        title: 'Q2 — POWER DIST',
        lines: [
          { c: 'cm', t: '// What is the output?' },
          { t: '' },
          { c: 'fn', t: 'public static void main(String[] args) {' },
          { t: '    System.out.println(8 / 2);' },
          { t: '}' },
        ],
        answer: '4',
      },
      {
        title: 'Q3 — POWER DIST',
        lines: [
          { c: 'cm', t: '// What is the output?' },
          { t: '' },
          { c: 'fn', t: 'public static void main(String[] args) {' },
          { t: '    int x = 2; x += 4;' },
          { t: '    System.out.println(x);' },
          { t: '}' },
        ],
        answer: '6',
      },
      {
        title: 'Q4 — POWER DIST',
        lines: [
          { c: 'cm', t: '// What is the output?' },
          { t: '' },
          { c: 'fn', t: 'public static void main(String[] args) {' },
          { t: '    System.out.println(5 - 5);' },
          { t: '}' },
        ],
        answer: '0',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// getPasscode(langId)
// Returns the 4-digit passcode string for the given language id.
// ─────────────────────────────────────────────────────────────────────────────
export function getPasscode(langId) {
  const lang = CODING_LANGUAGES.find(l => l.id === langId);
  if (!lang) return '';
  return lang.questions.map(q => q.answer).join('');
}
