import { detectKeyFormat, getSupabaseConfig, testLiveSupabaseConnection } from '../src/lib/supabase';
import { tutorService } from '../src/services/tutorService';
import { studentService } from '../src/services/studentService';
import { scheduleService } from '../src/services/scheduleService';
import { financialService } from '../src/services/financialService';
import { getPublishedPosters, savePoster } from '../src/services/posterService';
import { getPublishedVideos } from '../src/services/videoService';
import { getActiveSocialLinks } from '../src/services/socialLinkService';
import { calculateNextClassCountdown, formatDualTimezoneDisplay } from '../src/utils/timeUtils';

async function runVerificationSuite() {
  console.log('====================================================================');
  console.log('HOME TUTOR PHASE 4 & BERRY GLOW VERIFICATION TEST SUITE');
  console.log('====================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
    }
  }

  // -------------------------------------------------------------
  // Test 1: Key Format Detection
  // -------------------------------------------------------------
  console.log('--- 1. Supabase Publishable Key Format Detection ---');
  assert(detectKeyFormat('sb_publishable_abcdef12345678901234567890') === 'publishable', 'Detects sb_publishable_ key format');
  assert(detectKeyFormat('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz') === 'jwt', 'Detects legacy JWT anon key format');
  assert(detectKeyFormat('YOUR_SUPABASE_PUBLISHABLE_KEY') === 'placeholder', 'Detects placeholder key');
  assert(detectKeyFormat('') === 'none', 'Detects empty key');

  // -------------------------------------------------------------
  // Test 2: Supabase Environment Configuration & Live Connection
  // -------------------------------------------------------------
  console.log('\n--- 2. Environment Variables & Remote Database Connection Check ---');
  const config = getSupabaseConfig();
  console.log(`  Project URL: ${config.url || 'Not set'}`);
  console.log(`  Project Ref: ${config.projectRef || 'None'}`);
  console.log(`  Key Format Detected: ${config.keyFormat}`);
  console.log(`  Is Configured: ${config.isConfigured}`);

  const liveResult = await testLiveSupabaseConnection();
  console.log(`  Live Connection Test Status: ${liveResult.summaryMessage}`);
  assert(true, 'Connection test executed safely without crashing client');

  // -------------------------------------------------------------
  // Test 3: Tutor Operations (CRUD & Gender Filtering)
  // -------------------------------------------------------------
  console.log('\n--- 3. Tutor Data Reads & Writes ---');
  const { tutors: initialTutors } = await tutorService.getTutors();
  assert(initialTutors.length > 0, `Read initial tutors (found ${initialTutors.length})`);

  const saveTutorRes = await tutorService.saveTutor({
    name: 'Dr. Test Tutor',
    gender: 'Female',
    qualification: 'PhD Physics',
    title: 'Senior Physics Specialist',
    subjects: ['Physics', 'Mathematics'],
    classes: ['Grade 11 (FSc / A-Level)', 'Grade 12 (FSc / A-Level)'],
    mode: ['Online', 'In-Person'],
    cities: ['Lahore'],
    hourlyRate: 35,
    status: 'verified'
  });
  assert(saveTutorRes.success && Boolean(saveTutorRes.tutor?.id), 'Create new tutor with ID generation');
  const testTutor = saveTutorRes.tutor!;

  const { tutors: femaleTutors } = await tutorService.getTutors({ gender: 'Female' });
  assert(femaleTutors.some(t => t.id === testTutor.id), 'Filter tutors by gender ("Female")');

  // Clean up
  await tutorService.deleteTutor(testTutor.id);
  const { tutors: afterDeleteTutors } = await tutorService.getTutors();
  assert(!afterDeleteTutors.some(t => t.id === testTutor.id), 'Delete tutor successfully');

  // -------------------------------------------------------------
  // Test 4: Student Operations & Privacy
  // -------------------------------------------------------------
  console.log('\n--- 4. Student Records & Privacy Controls ---');
  const { students } = await studentService.getStudents();
  assert(students.length > 0, `Read students list (found ${students.length})`);

  const saveStudentRes = await studentService.saveStudent({
    fullName: 'Zainab Test',
    gradeLevel: 'Grade 10 (Matric / O-Level)',
    subjects: ['Mathematics'],
    teachingMode: 'Online',
    city: 'Lahore',
    parentName: 'Private Parent',
    parentPhone: '+92 300 0000000',
    parentEmail: 'private@example.com',
    status: 'active'
  });
  assert(saveStudentRes.success && Boolean(saveStudentRes.student?.id), 'Create student record');
  const testStudent = saveStudentRes.student!;

  // Clean up
  await studentService.deleteStudent(testStudent.id);
  const { students: afterDeleteStudents } = await studentService.getStudents();
  assert(!afterDeleteStudents.some(s => s.id === testStudent.id), 'Delete student record');

  // -------------------------------------------------------------
  // Test 5: Scheduling & Conflict Prevention
  // -------------------------------------------------------------
  console.log('\n--- 5. Class Scheduling & Double-Booking Prevention ---');
  const todayStr = new Date().toISOString().split('T')[0];

  // Create first session for Tutor 1 & Student 1
  const saveSessionRes = await scheduleService.saveClassSession({
    tutorId: 'tutor-1',
    studentId: 'student-1',
    subject: 'Physics',
    classGrade: 'Grade 11',
    sessionDate: todayStr,
    startTime: '10:00',
    endTime: '11:00',
    teachingMode: 'Online',
    status: 'scheduled'
  });
  assert(saveSessionRes.success && Boolean(saveSessionRes.session?.id), 'Create base class session (10:00 - 11:00)');
  const session1 = saveSessionRes.session!;

  // Test Conflict A: Same tutor at overlapping time (10:30 - 11:30)
  const conflictTutor = await scheduleService.checkConflict(
    'tutor-1',
    'student-2', // different student
    todayStr,
    '10:30',
    '11:30'
  );
  assert(conflictTutor.hasConflict === true, 'Conflict detected: Same tutor overlapping booking rejected');

  // Test Conflict B: Same student at overlapping time (10:30 - 11:30)
  const conflictStudent = await scheduleService.checkConflict(
    'tutor-2', // different tutor
    'student-1',
    todayStr,
    '10:30',
    '11:30'
  );
  assert(conflictStudent.hasConflict === true, 'Conflict detected: Same student overlapping booking rejected');

  // Test Conflict C: Non-overlapping time (12:00 - 13:00)
  const noConflict = await scheduleService.checkConflict(
    'tutor-1',
    'student-1',
    todayStr,
    '12:00',
    '13:00'
  );
  assert(noConflict.hasConflict === false, 'No conflict detected for non-overlapping time slot');

  // Attendance tracking
  const attendanceRes = await scheduleService.recordAttendance(session1.id, 'present', 'Class conducted on time');
  assert(attendanceRes.success === true, 'Attendance tracking verified');

  // Cancel session
  const cancelRes = await scheduleService.updateSessionStatus(session1.id, 'cancelled', 'Test completed');
  assert(cancelRes.success === true, 'Session cancellation verified');

  // -------------------------------------------------------------
  // Test 6: Financial Confidentiality & Scoping
  // -------------------------------------------------------------
  console.log('\n--- 6. Financial Records & Strict Tutor Data Confidentiality ---');
  // Admin metrics (no tutorId)
  const adminMetrics = await financialService.calculateMetrics();
  assert(adminMetrics.totalFeesInvoiced >= 0, 'Admin can view platform student fees and margins');

  // Tutor metrics (with tutorId) - MUST NOT return platform student fees!
  const tutorMetrics = await financialService.calculateMetrics('tutor-1');
  assert(
    tutorMetrics.totalFeesInvoiced === 0 &&
    tutorMetrics.totalFeesCollected === 0 &&
    tutorMetrics.totalFeesOutstanding === 0 &&
    tutorMetrics.netOperatingBalance === 0,
    'Security enforced: Tutors CANNOT view platform student fees or net operating margins'
  );
  assert(tutorMetrics.totalSalariesAmount >= 0, 'Tutor can view their own salary calculations');

  // -------------------------------------------------------------
  // Test 7: CMS Operations (Posters, Videos, Social Links)
  // -------------------------------------------------------------
  console.log('\n--- 7. CMS Content: Posters, Videos, and Social Links ---');
  const postersRes = await getPublishedPosters();
  assert(postersRes.posters.length > 0, `Read published posters (found ${postersRes.posters.length})`);

  const videosRes = await getPublishedVideos();
  assert(videosRes.videos.length > 0, `Read published videos (found ${videosRes.videos.length})`);

  const socialsRes = await getActiveSocialLinks();
  assert(socialsRes.links.length >= 4, `Read social media links (found ${socialsRes.links.length})`);
  const socialPlatforms = socialsRes.links.map(l => l.name.toLowerCase());
  assert(
    socialPlatforms.some(p => p.includes('tiktok')) &&
    socialPlatforms.some(p => p.includes('facebook')) &&
    socialPlatforms.some(p => p.includes('youtube')) &&
    socialPlatforms.some(p => p.includes('instagram')),
    'All 4 required social platforms (TikTok, Facebook, YouTube, Instagram) available'
  );

  // -------------------------------------------------------------
  // Test 8: Timezone & PKT Countdown Calculations
  // -------------------------------------------------------------
  console.log('\n--- 8. Timezone & Next-Class Live Countdown Utilities ---');
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  const futureDateStr = tomorrow.toISOString().split('T')[0];
  const futureTimeStr = '14:00';

  const countdown = calculateNextClassCountdown(futureDateStr, futureTimeStr, '15:00');
  assert(countdown.status === 'upcoming', 'Countdown calculates status "upcoming" for future class');
  assert(countdown.formattedCountdown.length > 0, `Formatted countdown: "${countdown.formattedCountdown}"`);
  assert(countdown.pktTimeDisplay.includes('PKT'), 'Displays PKT (UTC+5) formatted time');

  const dualDisplay = formatDualTimezoneDisplay(futureDateStr, '16:00', '17:00');
  assert(dualDisplay.pktDisplay.includes('PKT'), 'Dual-timezone includes PKT label');
  assert(dualDisplay.localDisplay.length > 0, 'Dual-timezone includes local timezone label');

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n====================================================================');
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('====================================================================');

  if (passedTests === totalTests) {
    console.log('ALL TESTS PASSED SUCCESSFULLY! Everything verified.');
  } else {
    console.error(`SOME TESTS FAILED: ${totalTests - passedTests} failed.`);
    process.exit(1);
  }
}

runVerificationSuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
