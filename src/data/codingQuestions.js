/**
 * src/data/codingQuestions.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Round 2 — Anomaly Detection question bank.
 *
 * Four language modules (C, C++, Java, Python). Each module has 4 bug-hunt
 * questions of escalating type:
 *   1. Locate     — find the line number where the bug occurs
 *   2. Count      — count how many bugs/violations exist
 *   3. Predict    — predict the program's output
 *   4. Diagnostic — compute a final value after understanding the bug
 *
 * After a player solves all 4 questions for a module, the module's
 * `overrideCode` is revealed and they must re-enter it to fully restore
 * that system and complete the round (same reveal → re-enter pattern as
 * Round 3's hidden key).
 *
 * ⚠️ NOTE: The C++ "Count" module's code snippet (below) is Python, not
 * C++ — this is preserved exactly as supplied. The question text references
 * a "constructor," which the snippet doesn't have. Worth fixing with real
 * C++ code before this goes live.
 */

function codeLines(raw) {
    // Strips a leading "N: " line-number prefix from each line of a template
    // literal block, so authors can paste numbered snippets directly.
    return raw
        .split('\n')
        .filter((_, i, arr) => !(i === 0 && arr[0].trim() === '') && !(i === arr.length - 1 && arr[arr.length - 1].trim() === ''))
        .map((line) => {
            const stripped = line.replace(/^\s*\d+:\s?/, '');
            const isComment = /^\s*(\/\/|#(?!include))/.test(stripped) && !/^#include/.test(stripped.trim());
            return { t: stripped, c: isComment ? 'cm' : undefined };
        });
}

// ── DATASET 1: C ──────────────────────────────────────────────────────────────
const C_MODULE = {
    id: 1,
    lang: 'C',
    col: '#ffaa00',
    rgb: '255,170,0',
    icon: '🔩',
    overrideCode: '6142',
    questions: [
        {
            type: 'locate',
            title: '📍 LOCATE THE ANOMALY',
            answerLabel: 'ENTER THE LINE NUMBER',
            prompt:
                'Enter the line number that invokes critical undefined behavior by breaking memory management rules regarding stack-allocated variables.',
            lines: codeLines(`
1: #include <stdio.h>
2: int main() {
3:     int array[4] = {10, 20, 30, 40};
4:     int *ptr = array;
5:     printf("%d", *(ptr + 1));
6:     free(ptr);
7:     return 0;
8: }
      `),
            answer: '6',
        },
        {
            type: 'count',
            title: '🧩 COUNT THE ANOMALIES',
            answerLabel: 'HOW MANY ANOMALIES?',
            prompt: 'How many lines contain the destructive memory violation?',
            lines: codeLines(`
1: #include <stdio.h>
2: struct Pack {
3:     int id;
4:     char flag;
5:     long long timestamp;
6: } __attribute__((packed));
7:
8: void process() {
9:     struct Pack p;
10:    int *ptr = (int*)&p.flag;
11:    *ptr = 0xFFFFFFFF;
12: }
      `),
            answer: '2',
        },
        {
            type: 'predict',
            title: '⚡ PREDICT THE EXECUTION',
            answerLabel: 'WHAT IS THE OUTPUT?',
            prompt:
                'Due to implicit balancing conversion rules (Usual Arithmetic Conversions), signed operands are promoted to unsigned during mixed operations. What numeric value is printed?',
            lines: codeLines(`
1: #include <stdio.h>
2: int main() {
3:     unsigned int limit = 0;
4:     int counter = -1;
5:     if (counter > limit) {
6:         printf("%d", 4);
7:     } else {
8:         printf("%d", 9);
9:     }
10:    return 0;
11: }
      `),
            answer: '4',
        },
        {
            type: 'diagnostic',
            title: '🔐 FINAL DIAGNOSTIC',
            answerLabel: 'WHAT IS THE FINAL VALUE?',
            prompt:
                'Calculate the complete sequence of bitwise shifts according to strict operator precedence (left-to-right evaluation for identical precedence groups). What is the exact final value?',
            lines: codeLines(`
1: #include <stdio.h>
2: int main() {
3:     int alpha = 5;
4:     int beta = 2;
5:     int result = alpha >> beta << 1;
6:     printf("%d", result);
7:     return 0;
8: }
      `),
            answer: '2',
        },
    ],
};

// ── DATASET 2: C++ ───────────────────────────────────────────────────────────
const CPP_MODULE = {
    id: 2,
    lang: 'C++',
    col: '#5ac8e8',
    rgb: '90,200,232',
    icon: '🧩',
    overrideCode: '6248',
    questions: [
        {
            type: 'locate',
            title: '📍 LOCATE THE ANOMALY',
            answerLabel: 'ENTER THE LINE NUMBER',
            prompt: 'Enter the line number containing a critical logic bug.',
            lines: codeLines(`
1: #include <iostream>
2: struct Base { virtual void log() {} };
3: struct Derived : public Base { void log() override {} };
4: int main() {
5:     Base* b = new Base();
6:     Derived* d = static_cast<Derived*>(b);
7:     d->log();
8: }
      `),
            answer: '6',
        },
        {
            type: 'count',
            title: '🧩 COUNT THE ANOMALIES',
            answerLabel: 'HOW MANY ANOMALIES?',
            prompt: 'How many initialization/compilation constraints are broken in this constructor layout?',
            lines: codeLines(`
1: values = [10, 20, 30]
2: for i in range(len(values)+1):
3:     if values[i] % 2 == 0:
4:         values.remove(values[i])
5:
6: print(values)
      `),
            answer: '2',
        },
        {
            type: 'predict',
            title: '⚡ PREDICT THE EXECUTION',
            answerLabel: 'WHAT IS THE OUTPUT?',
            prompt:
                'In C++, shifting a signed 32-bit integer beyond its width minus one or shifting a negative value induces an undefined execution state. If optimized out under strict modern standards, what sequence fallback value is output on line 5?',
            lines: codeLines(`
1: #include <iostream>
2: int main() {
3:     int x = 1;
4:     int y = x << 31;
5:     std::cout << 4;
6: }
      `),
            answer: '4',
        },
        {
            type: 'diagnostic',
            title: '🔐 FINAL DIAGNOSTIC',
            answerLabel: 'WHAT IS THE FINAL VALUE?',
            prompt: 'What is the exact value printed?',
            lines: codeLines(`
1: #include <iostream>
2: int& get(int &x){
3:     return x;
4: }
5: int main(){
6:     int a = 5;
7:     get(a) += 3;
8:     std::cout << a;
9: }
      `),
            answer: '8',
        },
    ],
};

// ── DATASET 3: JAVA ──────────────────────────────────────────────────────────
const JAVA_MODULE = {
    id: 3,
    lang: 'JAVA',
    col: '#ff5050',
    rgb: '255,80,80',
    icon: '☕',
    overrideCode: '5123',
    questions: [
        {
            type: 'locate',
            title: '📍 LOCATE THE ANOMALY',
            answerLabel: 'ENTER THE LINE NUMBER',
            prompt:
                'Enter the line number where thread-safe data modification fails because a structural modifier was incorrectly trusted to provide transaction atomicity instead of lock synchronization.',
            lines: codeLines(`
1: public class ThreadRace implements Runnable {
2:     private volatile int counter = 0;
3:     public void run() {
4:         for(int i=0; i<100; i++) {
5:             counter++;
6:         }
7:     }
8: }
      `),
            answer: '5',
        },
        {
            type: 'count',
            title: '🧩 COUNT THE ANOMALIES',
            answerLabel: 'HOW MANY ANOMALIES?',
            prompt: 'How many compilation errors exist regarding type-erasure runtime limitations inside this generic blueprint constructor?',
            lines: codeLines(`
1: public class GenericArray<T> {
2:     private T[] data;
3:     public GenericArray() {
4:         data = new T[10];
5:     }
6: }
      `),
            answer: '1',
        },
        {
            type: 'predict',
            title: '⚡ PREDICT THE EXECUTION',
            answerLabel: 'WHAT IS THE OUTPUT?',
            prompt:
                "What numeric value is output given Java's explicit Integer Cache mechanism limits (-128 to 127)?",
            lines: codeLines(`
1: public class AutoboxTrap {
2:     public static void main(String[] args) {
3:         Integer val1 = 127;
4:         Integer val2 = 127;
5:         Integer val3 = 128;
6:         Integer val4 = 128;
7:         if (val1 == val2 && val3 == val4) {
8:             System.out.println(1);
9:         } else {
10:            System.out.println(2);
11:        }
12:    }
13: }
      `),
            answer: '2',
        },
        {
            type: 'diagnostic',
            title: '🔐 FINAL DIAGNOSTIC',
            answerLabel: 'WHAT IS THE FINAL VALUE?',
            prompt:
                "Evaluate the unsigned right shift (>>>) on a 32-bit two's complement integer representation of -1. What is the calculated numerical output?",
            lines: codeLines(`
1: public class BitCalc {
2:     public static void main(String[] args) {
3:         int mask = -1; // All bits 1
4:         int shift = mask >>> 30;
5:         System.out.println(shift);
6:     }
7: }
      `),
            answer: '3',
        },
    ],
};

// ── DATASET 4: PYTHON ────────────────────────────────────────────────────────
const PYTHON_MODULE = {
    id: 4,
    lang: 'PYTHON',
    col: '#39ff14',
    rgb: '57,255,20',
    icon: '🐍',
    overrideCode: '5012',
    questions: [
        {
            type: 'locate',
            title: '📍 LOCATE THE ANOMALY',
            answerLabel: 'ENTER THE LINE NUMBER',
            prompt:
                'Modifying a collection while actively iterating over it directly skips evaluation markers due to internal pointer shifting. Enter the line number where this architectural structural bug occurs.',
            lines: codeLines(`
1: def process_nodes():
2:     cache = [1, 2, 3, 4, 5]
3:     for item in cache:
4:         if item % 2 == 0:
5:             cache.remove(item)
6:     print(len(cache))
      `),
            answer: '5',
        },
        {
            type: 'count',
            title: '🧩 COUNT THE ANOMALIES',
            answerLabel: 'HOW MANY ANOMALIES?',
            prompt: 'How many exceptions/unbound local variable errors will be thrown by the python interpreter stack if this module runs?',
            lines: codeLines(`
1: def load_configs():
2:     global calculation
3:     print(calculation)
4:     calculation = 20
5:
6: calculation = 10
7: load_configs()
      `),
            answer: '0',
        },
        {
            type: 'predict',
            title: '⚡ PREDICT THE EXECUTION',
            answerLabel: 'WHAT IS THE OUTPUT?',
            prompt:
                'In Python, bool subclasses int. Given calculation order rules, calculate the numerical return printed to the standard console block.',
            lines: codeLines(`
1: def evaluate_bools():
2:     output = True + True * False
3:     print(output)
4:
5: evaluate_bools()
      `),
            answer: '1',
        },
        {
            type: 'diagnostic',
            title: '🔐 FINAL DIAGNOSTIC',
            answerLabel: 'WHAT IS THE FINAL VALUE?',
            prompt: 'What value is printed?',
            lines: codeLines(`
1: values = ([1],)
2: try:
3:     values[0] += [2]
4: except TypeError:
5:     pass
6: print(len(values[0]))
      `),
            answer: '2',
        },
    ],
};

const ALL_MODULES = [C_MODULE, CPP_MODULE, JAVA_MODULE, PYTHON_MODULE];

/**
 * Returns the Round 2 module set. Order is fixed (C, C++, Java, Python) so
 * module ids stay stable for any id-specific CSS in round2.css. Returns a
 * deep-ish copy so consumers can't accidentally mutate the source data.
 */
export function buildRound2Modules() {
    return ALL_MODULES.map((m) => ({
        ...m,
        questions: m.questions.map((q) => ({ ...q, lines: q.lines.map((l) => ({ ...l })) })),
    }));
}

export { C_MODULE, CPP_MODULE, JAVA_MODULE, PYTHON_MODULE };