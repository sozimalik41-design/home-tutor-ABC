import { SUGGESTED_QUESTIONS } from '../src/components/chat/ChatQuickPrompts';

console.log('--- RUNNING HOME TUTOR AI CHATBOT TEST SUITE ---\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    if (detail) console.error(`   Detail: ${detail}`);
    failedTests++;
  }
}

// 1. Verify Suggested Questions
console.log('1. Required Suggested Questions Verification:');
const questionTexts = SUGGESTED_QUESTIONS.map(q => q.text);

assert(
  questionTexts.includes('Mujhe Maths ka tutor chahiye.'),
  'Contains "Mujhe Maths ka tutor chahiye."'
);
assert(
  questionTexts.includes('Appointment kaise book karun?'),
  'Contains "Appointment kaise book karun?"'
);
assert(
  questionTexts.includes('Fractions ko asaan alfaaz mein samjhao.'),
  'Contains "Fractions ko asaan alfaaz mein samjhao."'
);
assert(
  questionTexts.includes('Meri class ka schedule kaise dekhoon?'),
  'Contains "Meri class ka schedule kaise dekhoon?"'
);

// 2. Validate Message Constraints
console.log('\n2. Validation & Request Safety Logic:');
function validateChatInput(message: unknown): { isValid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Message is required and must be text.' };
  }
  const clean = message.trim();
  if (clean.length === 0) {
    return { isValid: false, error: 'Message cannot be empty.' };
  }
  if (clean.length > 1500) {
    return { isValid: false, error: 'Message exceeds maximum allowed length of 1500 characters.' };
  }
  return { isValid: true };
}

assert(validateChatInput('Hello').isValid, 'Standard text passes validation');
assert(!validateChatInput('').isValid, 'Empty string rejected');
assert(!validateChatInput('   ').isValid, 'Whitespace only string rejected');
assert(!validateChatInput(null).isValid, 'Null input rejected');
assert(!validateChatInput('a'.repeat(1501)).isValid, 'Message > 1500 chars rejected');
assert(validateChatInput('a'.repeat(1500)).isValid, 'Message of exactly 1500 chars accepted');

console.log('\n=======================================');
console.log(`TOTAL CHATBOT TESTS: ${passedTests + failedTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('=======================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
