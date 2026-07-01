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
 * Each module also carries a `hint` — a short riddle whose four lines map
 * (in order) to the Locate / Count / Predict / Diagnostic answers, i.e. the
 * digits of `overrideCode`. It's shown inside the override-code popup once
 * the module is fully solved, as a nudge for anyone who forgot to note
 * their answers down.
 *
 * ⚠️ NOTE: The C++ "Count" module's code snippet (below) is Python, not
 * C++ — this is preserved exactly as supplied. The question text references
 * "runtime/logic constraints," which doesn't perfectly match C++ syntax.
 * Worth fixing with real C++ code before this goes live.
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
    overrideCode: '2462',
    hint:
        'The quiet one opens the door.\n' +
        'The complete one guards the center.\n' +
        'The mighty follows.\n' +
        'The silent twin remains until the end.',
    questions: [
        {
            type: 'locate',
            title: '📍 LOCATE THE ANOMALY',
            answerLabel: 'ENTER THE LINE NUMBER',
            prompt:
                'Enter the line number containing the critical memory-management violation.',
            lines: codeLines(`
1: #include <stdio.h>
2: #include <stdlib.h>
3:
4: int main(){
5:     int *ptr = malloc(4 * sizeof(int));
6:     free(ptr);
7:     for(int i = 0; i < 4; i++)
8:         ptr[i] = i * 10;
9:     printf("Diagnostics Complete\\n");
10:    return 0;
11: }
      `),
            answer: '6',
        },
        {
            type: 'count',
            title: '🧩 COUNT THE ANOMALIES',
            answerLabel: 'HOW MANY ANOMALIES?',
            prompt: 'How many lines directly contribute to the unsafe memory operation?',
            lines: codeLines(`
1: #include <stdio.h>
2:
3: struct Pack{
4:     int id;
5:     char flag;
6:     long long timestamp;
7: } __attribute__((packed));
8:
9: void process(){
10:    struct Pack p;
11:    p.id=101;
12:    int *ptr=(int*)&p.flag;
13:    *ptr=0xFFFFFFFF;
14:    printf("Processed\\n");
15: }
      `),
            answer: '2',
        },
        {
            type: 'predict',
            title: '⚡ PREDICT THE EXECUTION',
            answerLabel: 'WHAT IS THE OUTPUT?',
            prompt: 'What digit is printed?',
            lines: codeLines(`
1: #include <stdio.h>
2:
3: int main(){
4:     unsigned int limit=0;
5:     int counter=-1;
6:
7:     printf("Checking...\\n");
8:
9:     if(counter>limit){
10:        printf("%d",4);
11:    }
12:    else{
13:        printf("%d",9);
14:    }
15:
16:    return 0;
17: }
      `),
            answer: '4',
        },
        {
            type: 'diagnostic',
            title: '🔐 FINAL DIAGNOSTIC',
            answerLabel: 'WHAT IS THE FINAL VALUE?',
            prompt: 'What is the final value printed?',
            lines: codeLines(`
1: #include <stdio.h>
2:
3: int main(){
4:     int alpha=5;
5:     int beta=2;
6:
7:     printf("Shift Diagnostic\\n");
8:
9:     int result=alpha>>beta<<1;
10:
11:    printf("%d",result);
12:
13:    return 0;
14: }
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
    overrideCode: '4268',
    hint:
        'Perfection opens the way.\n' +
        'Humility walks beside it.\n' +
        'Growth follows naturally.\n' +
        'The greatest closes the gate.',
    questions: [
        {
            type: 'locate',
            title: '📍 LOCATE THE ANOMALY',
            answerLabel: 'ENTER THE LINE NUMBER',
            prompt: 'Enter the line number containing the critical logic bug.',
            lines: codeLines(`
1: #include <iostream>
2: using namespace std;
3: struct Base { virtual void log() {} };
4: struct Derived : public Base { void log() override {} };
5: int main() {
6:     Base* b = new Base();
7:     Derived* d = dynamic_cast<Derived*>(b);
8:     if (d) d->log();
9:     cout << "Diagnostics Complete\\n";
10:    int status = 1;
11:    if(status) cout << "Module Verified\\n";
12:    delete b;
13:    return 0;
14: }
      `),
            answer: '6',
        },
        {
            type: 'count',
            title: '🧩 COUNT THE ANOMALIES',
            answerLabel: 'HOW MANY ANOMALIES?',
            prompt: 'How many independent runtime/logic constraints are broken in this implementation?',
            lines: codeLines(`
1: values = [10, 20, 30]
2: for i in range(len(values)+1):
3:     if values[i] % 2 == 0:
4:         values.remove(values[i])
5:
6: removed = len(values)
7: print("Remaining:", values)
8: print("Items Left:", removed)
9:
10: if removed > 0:
11:     print("Scan Complete")
12: else:
13:     print("Empty")
14:
15: print("End")
      `),
            answer: '2',
        },
        {
            type: 'predict',
            title: '⚡ PREDICT THE EXECUTION',
            answerLabel: 'WHAT IS THE OUTPUT?',
            prompt:
                'In C++, shifting a signed 32-bit integer beyond its width minus one may invoke undefined behavior. If the compiler optimizes away the undefined computation, what value is ultimately printed?',
            lines: codeLines(`
1: #include <iostream>
2: using namespace std;
3: int main() {
4:     int x = 1;
5:     int y = x << 31;
6:     int z = y;
7:     if(z == 0)
8:         cout << "";
9:     else
10:        cout << "";
11:    cout << 4;
12:    return 0;
13: }
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
7:     int backup = a;
8:     get(a) += 3;
9:     std::cout << a;
10:    backup = a;
11:    if(backup > 0){
12:        std::cout << "";
13:    }
14:    return 0;
15: }
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
    hint:
        'The pair opens the gate.\n' +
        'The hand follows.\n' +
        'Return to the source.\n' +
        'The triangle seals the lock.',
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
8:     public int getCounter() {
9:         return this.counter;
10:    }
11:    public void reset() {
12:        this.counter = 0;
13:    }
14: }
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
6:     public T get(int index) {
7:         return data[index];
8:     }
9:     public void set(int index, T item) {
10:        data[index] = item;
11:    }
12:    public int size() {
13:        return 10;
14:    }
15: }
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
3:         int mask = -1;
4:         int shift = mask >>> 30;
5:         System.out.println(shift);
6:     }
7:     public static int getVersion() {
8:         return 1;
9:     }
10:    public static int getRevision() {
11:        return 0;
12:    }
13: }
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
    overrideCode: '9145',
    hint:
        'The tallest stands guard at the entrance.\n' +
        'The only number born from equal twins follows.\n' +
        'The beginning of all counting comes next.\n' +
        'The final traveler completes the path.',
    questions: [
        {
            type: 'locate',
            title: '📍 LOCATE THE ANOMALY',
            answerLabel: 'ENTER THE LINE NUMBER',
            prompt:
                "Modifying a list's size while iterating directly over it shifts the internal index pointers, causing the loop to skip the very next item. Enter the line number where this structural mutation bug occurs.",
            lines: codeLines(`
1:  def remove_bad_items(items):
2:      for number in items:
3:          if number < 5:
4:              items.remove(number)
5:
6:      final_count = len(items)
7:      return final_count
8:
9:  data = [1, 2, 3, 4, 5, 6]
10: result = remove_bad_items(data)
11: print(result)
      `),
            answer: '4',
        },
        {
            type: 'count',
            title: '🧩 COUNT THE ANOMALIES',
            answerLabel: 'HOW MANY ANOMALIES?',
            prompt: 'How many exceptions (UnboundLocalError) will be thrown by the Python interpreter stack if this module runs?',
            lines: codeLines(`
1:  def run_counter():
2:      total = 10
3:
4:      def add_to_total():
5:          print(total)
6:          total = 20
7:
8:      add_to_total()
9:      return total
10:
11: final_value = run_counter()
12: print(final_value)
      `),
            answer: '1',
        },
        {
            type: 'predict',
            title: '⚡ PREDICT THE EXECUTION',
            answerLabel: 'WHAT IS THE OUTPUT?',
            prompt:
                'Given how Python copies references using * versus creating independent objects, predict the numerical integer value printed to the console.',
            lines: codeLines(`
1:  def calculate_points():
2:      grid_a = [[0]] * 3
3:      grid_b = [[0], [0], [0]]
4:
5:      grid_a[0][0] = 5
6:      grid_b[0][0] = 5
7:
8:      score_a = grid_a[2][0]
9:      score_b = grid_b[2][0]
10:
11:     final_score = score_a + score_b
12:     print(final_score)
13:
14: calculate_points()
      `),
            answer: '5',
        },
        {
            type: 'diagnostic',
            title: '🔐 FINAL DIAGNOSTIC',
            answerLabel: 'WHAT IS THE FINAL VALUE?',
            prompt: 'What value is printed to the standard console block at the conclusion of this routine?',
            lines: codeLines(`
1:  def update_record():
2:      user_data = ([10], [20])
3:
4:      try:
5:          user_data[0] += [9]
6:      except TypeError:
7:          pass
8:
9:      result = user_data[0][1]
10:     print(result)
11:     return result
12:
13: update_record()
      `),
            answer: '9',
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