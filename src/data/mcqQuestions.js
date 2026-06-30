/**
 * src/data/mcqQuestions.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Round 1 – Mission Clearance question bank.
 *
 * Structure: 4 categories × 5 questions = 20 questions per playthrough.
 * buildRound1Questions() picks all 5 from each category in shuffled category
 * order and returns them as a flat array.
 */

export const PER_CATEGORY = 5;

export const MCQ_CATEGORIES = [
  // ── COMMS — Networking, Web, Protocols ─────────────────────────────────────
  {
    id: 'comms',
    label: 'COMMS MODULE',
    color: '#38bdf8',
    icon: '📡',
    questions: [
      {
        q: 'Which protocol is used for secure web browsing?',
        opts: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
        ans: 2,
      },
      {
        q: 'Which HTML tag creates the largest heading?',
        opts: ['<h6>', '<heading>', '<h1>', '<head>'],
        ans: 2,
      },
      {
        q: 'Which language is used for styling web pages?',
        opts: ['HTML', 'JavaScript', 'CSS', 'Python'],
        ans: 2,
      },
      {
        q: 'What does IoT stand for?',
        opts: ['Internet of Things', 'Internet of Technology', 'Integration of Things', 'Interface of Things'],
        ans: 0,
      },
      {
        q: 'Which company developed the Android OS?',
        opts: ['Apple', 'Microsoft', 'Samsung', 'Google'],
        ans: 3,
      },
    ],
  },

  // ── ELECTRICAL — Math, Binary, Digital Logic ────────────────────────────────
  {
    id: 'electrical',
    label: 'ELECTRICAL',
    color: '#fbbf24',
    icon: '⚡',
    questions: [
      {
        q: 'What is 2 raised to the power of 10?',
        opts: ['20', '1024', '512', '2048'],
        ans: 1,
      },
      {
        q: 'What is the value of π to 2 decimal places?',
        opts: ['3.12', '3.14', '3.16', '3.18'],
        ans: 1,
      },
      {
        q: 'Which gate outputs 1 only when both inputs are 1?',
        opts: ['OR', 'NOT', 'AND', 'XOR'],
        ans: 2,
      },
      {
        q: 'Binary representation of decimal 10?',
        opts: ['1010', '1001', '1100', '0110'],
        ans: 0,
      },
      {
        q: 'What is the result of 5 XOR 3 in binary?',
        opts: ['6', '7', '4', '2'],
        ans: 0,
      },
    ],
  },

  // ── REACTOR — Algorithms & Data Structures ──────────────────────────────────
  {
    id: 'reactor',
    label: 'REACTOR CORE',
    color: '#f87171',
    icon: '⚛️',
    questions: [
      {
        q: 'Which data structure follows LIFO order?',
        opts: ['Queue', 'Stack', 'Tree', 'Graph'],
        ans: 1,
      },
      {
        q: 'Time complexity of binary search?',
        opts: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
        ans: 2,
      },
      {
        q: 'Which sorting algorithm has best average O(n log n)?',
        opts: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Selection Sort'],
        ans: 2,
      },
      {
        q: 'Which of these is NOT an OOP concept?',
        opts: ['Encapsulation', 'Polymorphism', 'Compilation', 'Inheritance'],
        ans: 2,
      },
      {
        q: 'What is the worst-case time complexity of quicksort?',
        opts: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
        ans: 2,
      },
    ],
  },

  // ── MEDBAY — CS Fundamentals, History, Databases ───────────────────────────
  {
    id: 'medbay',
    label: 'MEDBAY SCAN',
    color: '#4ade80',
    icon: '🏥',
    questions: [
      {
        q: 'What does CPU stand for?',
        opts: ['Central Process Unit', 'Central Processing Unit', 'Computer Personal Unit', 'Core Processing Unit'],
        ans: 1,
      },
      {
        q: 'Who invented the World Wide Web?',
        opts: ['Bill Gates', 'Steve Jobs', 'Tim Berners-Lee', 'Linus Torvalds'],
        ans: 2,
      },
      {
        q: 'What does RAM stand for?',
        opts: ['Read Access Memory', 'Random Access Memory', 'Rapid Access Module', 'Runtime Allocated Memory'],
        ans: 1,
      },
      {
        q: 'Which keyword declares a constant in JavaScript?',
        opts: ['var', 'let', 'const', 'static'],
        ans: 2,
      },
      {
        q: 'What does SQL stand for?',
        opts: ['Structured Query Language', 'Simple Query Logic', 'Standard Query Language', 'System Query List'],
        ans: 0,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// buildRound1Questions
// Randomly selects PER_CATEGORY questions from each category and returns them
// as a flat array tagged with category metadata. Called once on Round 1 mount.
// ─────────────────────────────────────────────────────────────────────────────
export function buildRound1Questions() {
  const result = [];

  for (const cat of MCQ_CATEGORIES) {
    // Shuffle the category's questions
    const shuffled = [...cat.questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, PER_CATEGORY);
    selected.forEach(q =>
      result.push({
        ...q,
        category: cat.label,
        categoryColor: cat.color,
        categoryIcon: cat.icon,
      })
    );
  }

  return result;
}
