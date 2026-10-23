import { 
  parseYouTubeUrl, 
  validateImageFile, 
  validateVideoFile, 
  isValidUrl 
} from '../src/utils/validators';
import { isSupabaseConfigured, getSupabaseConfig } from '../src/lib/supabase';

console.log('--- RUNNING PHASE 2 CMS TEST SUITE ---\n');

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

// 1. YouTube URL Validation Tests
console.log('1. YouTube Video URL Parsing Tests:');
const standardUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const parsedStandard = parseYouTubeUrl(standardUrl);
assert(parsedStandard.isValid && parsedStandard.videoId === 'dQw4w9WgXcQ', 'Standard watch?v= URL parsed to ID');
assert(parsedStandard.embedUrl === 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Embed URL correctly formatted');

const shortUrl = 'https://youtu.be/dQw4w9WgXcQ';
const parsedShort = parseYouTubeUrl(shortUrl);
assert(parsedShort.isValid && parsedShort.videoId === 'dQw4w9WgXcQ', 'Short youtu.be URL parsed');

const shortsUrl = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';
const parsedShorts = parseYouTubeUrl(shortsUrl);
assert(parsedShorts.isValid && parsedShorts.videoId === 'dQw4w9WgXcQ', 'YouTube shorts URL parsed');

const invalidUrl = 'https://invalid-video-site.com/video/12345';
const parsedInvalid = parseYouTubeUrl(invalidUrl);
assert(!parsedInvalid.isValid && Boolean(parsedInvalid.error), 'Invalid video URL rejected with error message');

// 2. Generic URL & Social Links Validation
console.log('\n2. Social Links & External URL Tests:');
assert(isValidUrl('https://tiktok.com/@hometutor.pk'), 'Valid TikTok HTTPS URL accepted');
assert(isValidUrl('https://facebook.com/HomeTutorOfficial'), 'Valid Facebook HTTPS URL accepted');
assert(isValidUrl('https://youtube.com/@hometutoracademy'), 'Valid YouTube HTTPS URL accepted');
assert(isValidUrl('https://instagram.com/hometutor.academy'), 'Valid Instagram HTTPS URL accepted');
assert(!isValidUrl('just_a_string'), 'Malformed non-URL string rejected');
assert(!isValidUrl('ftp://insecure-ftp'), 'Non-HTTP protocol rejected');

// 3. File Validation Tests (Image & Video)
console.log('\n3. Storage File Validation Tests:');
// Create dummy File objects
const mockValidImage = new File([''], 'poster.jpg', { type: 'image/jpeg' });
const validImgRes = validateImageFile(mockValidImage);
assert(validImgRes.isValid, 'Valid JPG image accepted');

const mockInvalidImage = new File([''], 'malicious.exe', { type: 'application/x-msdownload' });
const invalidImgRes = validateImageFile(mockInvalidImage);
assert(!invalidImgRes.isValid && Boolean(invalidImgRes.error), 'Disallowed executable file type rejected');

const mockValidVideo = new File([''], 'lesson.mp4', { type: 'video/mp4' });
const validVidRes = validateVideoFile(mockValidVideo);
assert(validVidRes.isValid, 'Valid MP4 video file accepted');

const mockInvalidVideo = new File([''], 'script.js', { type: 'application/javascript' });
const invalidVidRes = validateVideoFile(mockInvalidVideo);
assert(!invalidVidRes.isValid && Boolean(invalidVidRes.error), 'Disallowed JS file rejected as video');

// 4. Supabase Resilience & Fallback Tests
console.log('\n4. Supabase Configuration Safety Tests:');
const config = getSupabaseConfig();
assert(typeof config.isConfigured === 'boolean', 'Supabase isConfigured returns boolean flag');
assert(typeof config.url === 'string', 'Supabase URL returns string');
console.log(`   Current Supabase configuration state: ${config.isConfigured ? 'Configured' : 'Unconfigured (Safe Fallback Mode)'}`);

// Summary
console.log('\n=======================================');
console.log(`TOTAL CMS TESTS: ${passedTests + failedTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('=======================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
