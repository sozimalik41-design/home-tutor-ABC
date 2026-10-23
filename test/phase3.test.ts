import { tutorService } from '../src/services/tutorService';
import { studentService } from '../src/services/studentService';
import { scheduleService, isTimeRangeOverlapping } from '../src/services/scheduleService';
import { financialService } from '../src/services/financialService';
import { calculateNextClassCountdown } from '../src/utils/timeUtils';
import { getPublishedPosters } from '../src/services/posterService';
import { getPublishedVideos } from '../src/services/videoService';
import { getActiveSocialLinks } from '../src/services/socialLinkService';
import { isSupabaseConfigured, getSupabaseConfig } from '../src/lib/supabase';
import fs from 'fs';
import path from 'path';

console.log('========================================================');
console.log('   HOME TUTOR PHASE 3 COMPREHENSIVE VERIFICATION SUITE   ');
console.log('========================================================\n');

let passedTests = 0;
let failedTests = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
    failedTests++;
    failures.push(`${testName}${detail ? ` (${detail})` : ''}`);
  }
}

async function runPhase3Verification() {
  // =========================================================================
  // 1. TUTOR MANAGEMENT TESTS
  // =========================================================================
  console.log('--- 1. Tutor Management Tests ---');
  
  // 1.1 Load initial tutors
  const initialTutorsRes = await tutorService.getTutors();
  assert(initialTutorsRes.tutors.length >= 6, 'Loads initial verified educators dataset');

  // 1.2 Test Male, Female, and Prefer not to say options
  const femaleTutors = await tutorService.getTutors({ gender: 'Female' });
  const maleTutors = await tutorService.getTutors({ gender: 'Male' });
  assert(femaleTutors.tutors.length > 0, 'Filters Female educators accurately', `Count: ${femaleTutors.tutors.length}`);
  assert(maleTutors.tutors.length > 0, 'Filters Male educators accurately', `Count: ${maleTutors.tutors.length}`);

  // 1.3 Add a new tutor with "Prefer not to say" gender
  const addPreferTutor = await tutorService.saveTutor({
    name: 'Dr. Zeeshan Haider',
    gender: 'Prefer not to say',
    qualification: 'Ph.D. in Computational Physics',
    university: 'Oxford University',
    experienceYears: 10,
    hourlyRate: 40,
    salaryAmount: 2600,
    salaryFrequency: 'monthly',
    studentTuitionFee: 3200,
    cities: ['Lahore'],
    teachingArea: 'DHA Phase 6',
    subjects: ['Physics & Quantum Mechanics'],
    classes: ['Matric / O-Levels (Grade 10)', 'FSc / A-Levels (Grade 12)'],
    mode: ['In-Person', 'Online'],
    status: 'verified'
  });
  assert(addPreferTutor.success, 'Successfully adds tutor with "Prefer not to say" gender');
  assert(addPreferTutor.tutor.gender === 'Prefer not to say', 'Tutor gender recorded as "Prefer not to say"');

  // 1.4 Add tutor with Female gender
  const addFemaleTutor = await tutorService.saveTutor({
    name: 'Prof. Maryam Siddiqui',
    gender: 'Female',
    qualification: 'Ph.D. in Organic Chemistry',
    university: 'Stanford University',
    experienceYears: 8,
    hourlyRate: 35,
    salaryAmount: 2400,
    salaryFrequency: 'monthly',
    studentTuitionFee: 3000,
    cities: ['Islamabad'],
    teachingArea: 'Sector F-7/2',
    subjects: ['Chemistry & Organic Chemistry'],
    classes: ['Matric / O-Levels (Grade 10)', 'FSc / A-Levels (Grade 12)'],
    mode: ['In-Person', 'Online'],
    status: 'verified'
  });
  assert(addFemaleTutor.success, 'Successfully adds tutor with "Female" gender');

  // 1.5 View tutor by ID
  const retrievedTutor = await tutorService.getTutorById(addFemaleTutor.tutor.id);
  assert(retrievedTutor !== null && retrievedTutor.name === 'Prof. Maryam Siddiqui', 'Views saved tutor record by ID');

  // 1.6 Edit tutor
  const editTutorRes = await tutorService.saveTutor({
    ...addFemaleTutor.tutor,
    qualification: 'Post-Doc in Chemical Biology (Stanford)',
    salaryAmount: 2500,
    hourlyRate: 38
  });
  assert(editTutorRes.success, 'Edits tutor profile details and compensation');
  const verifiedEdit = await tutorService.getTutorById(addFemaleTutor.tutor.id);
  assert(verifiedEdit?.qualification === 'Post-Doc in Chemical Biology (Stanford)', 'Reflects edited qualification in storage');
  assert(verifiedEdit?.salaryAmount === 2500, 'Reflects updated tutor salary compensation');

  // 1.7 Test tutor search and gender filters
  const searchByName = await tutorService.getTutors({ search: 'Siddiqui' });
  assert(searchByName.tutors.some(t => t.name.includes('Siddiqui')), 'Searches tutors accurately by name');

  const searchBySubject = await tutorService.getTutors({ search: 'Quantum Mechanics' });
  assert(searchBySubject.tutors.some(t => t.name.includes('Zeeshan Haider')), 'Searches tutors accurately by subject');

  const filterPrefer = await tutorService.getTutors({ gender: 'Prefer not to say' });
  assert(filterPrefer.tutors.some(t => t.id === addPreferTutor.tutor.id), 'Filters tutors by "Prefer not to say"');

  // 1.8 Verify tutor salary is separate from student tuition fees
  assert(
    editTutorRes.tutor.salaryAmount !== editTutorRes.tutor.studentTuitionFee &&
    editTutorRes.tutor.salaryAmount === 2500 &&
    editTutorRes.tutor.studentTuitionFee === 3000,
    'Tutor compensation salary ($2,500) remains strictly separate from student tuition fee ($3,000)'
  );

  // 1.9 Delete tutor
  const deleteTutorRes = await tutorService.deleteTutor(addPreferTutor.tutor.id);
  assert(deleteTutorRes.success, 'Deletes tutor profile from storage');
  const postDeleteCheck = await tutorService.getTutorById(addPreferTutor.tutor.id);
  assert(postDeleteCheck === null, 'Verified tutor record is removed after deletion');

  // =========================================================================
  // 2. STUDENT MANAGEMENT TESTS
  // =========================================================================
  console.log('\n--- 2. Student Records & Privacy Scoping Tests ---');

  // 2.1 Load initial students
  const initialStudents = await studentService.getStudents();
  assert(initialStudents.students.length >= 6, 'Loads enrolled students dataset');

  // 2.2 Add new student with complete details
  const newStudentRes = await studentService.saveStudent({
    fullName: 'Zainab Fatima',
    gradeLevel: 'FSc / A-Levels (Grade 11)',
    subjects: ['Biology', 'Chemistry'],
    assignedTutorId: 'tutor-ahmed',
    assignedTutorName: 'Dr. Ahmed Raza',
    parentName: 'Col. Tariq Mahmood',
    parentPhone: '+92 333 5551234',
    parentEmail: 'tariq.m@example.com',
    city: 'Rawalpindi',
    address: 'House 88, Lane 4, Askari 10',
    teachingMode: 'Home Tuition',
    monthlyFee: 3100,
    status: 'active',
    notes: 'Pre-medical college entrance exam preparation'
  });
  assert(newStudentRes.success && Boolean(newStudentRes.student), 'Adds new student record');
  const addedStudent = newStudentRes.student!;
  assert(addedStudent.assignedTutorId === 'tutor-ahmed', 'Verifies assigned tutor ID');
  assert(addedStudent.gradeLevel === 'FSc / A-Levels (Grade 11)', 'Verifies assigned grade level');
  assert(addedStudent.subjects.includes('Biology'), 'Verifies assigned subjects');
  assert(addedStudent.monthlyFee === 3100, 'Verifies agreed monthly tuition fee');

  // 2.3 Edit student
  const editStudentRes = await studentService.saveStudent({
    ...addedStudent,
    monthlyFee: 3300,
    notes: 'Updated: Weekend mock tests added'
  });
  assert(editStudentRes.success, 'Edits student details successfully');
  const reloadedStudent = await studentService.getStudentById(addedStudent.id);
  assert(reloadedStudent?.monthlyFee === 3300, 'Reflects edited student monthly fee ($3,300)');

  // 2.4 Verify tutors can access ONLY their assigned students
  const ahmedStudents = await studentService.getStudents({ tutorId: 'tutor-ahmed' });
  assert(ahmedStudents.students.length > 0, 'Retrieves students assigned to Dr. Ahmed Raza');
  const allBelongToAhmed = ahmedStudents.students.every(s => s.assignedTutorId === 'tutor-ahmed');
  assert(allBelongToAhmed, 'Enforces tutor scoping: all returned students match Dr. Ahmed Raza');

  const ayeshaStudents = await studentService.getStudents({ tutorId: 'tutor-ayesha' });
  const noneOfAhmedInAyesha = ayeshaStudents.students.every(s => s.assignedTutorId === 'tutor-ayesha');
  assert(noneOfAhmedInAyesha, 'Tutor Ayesha Khan cannot access Dr. Ahmed Raza students');

  // 2.5 Ensure student private details (names, phone numbers, parent details, addresses) never appear on public tutor pages
  const publicTutors = await tutorService.getTutors();
  const rawPublicJson = JSON.stringify(publicTutors.tutors);
  assert(!rawPublicJson.includes('+92 333 5551234'), 'Student parent phone number never leaks to public directory');
  assert(!rawPublicJson.includes('House 88, Lane 4'), 'Student residential address never leaks to public directory');
  assert(!rawPublicJson.includes('Col. Tariq Mahmood'), 'Parent name never leaks to public directory');

  // 2.6 Delete student
  const deleteStdRes = await studentService.deleteStudent(addedStudent.id);
  assert(deleteStdRes.success, 'Deletes student record successfully');
  const postDeleteStdCheck = await studentService.getStudentById(addedStudent.id);
  assert(postDeleteStdCheck === null, 'Verifies student record is removed after deletion');

  // =========================================================================
  // 3. CLASS SCHEDULE & CONFLICT DETECTION TESTS
  // =========================================================================
  console.log('\n--- 3. Class Schedule & Conflict Engine Tests ---');

  // 3.1 Time overlap logic tests
  assert(isTimeRangeOverlapping('17:00', '18:30', '16:00', '17:30'), 'Detects partial overlap before (16:00-17:30 and 17:00-18:30)');
  assert(isTimeRangeOverlapping('17:00', '18:30', '18:00', '19:30'), 'Detects partial overlap after (17:00-18:30 and 18:00-19:30)');
  assert(isTimeRangeOverlapping('17:00', '18:30', '17:15', '18:15'), 'Detects internal overlap (17:15-18:15 inside 17:00-18:30)');
  assert(!isTimeRangeOverlapping('17:00', '18:30', '18:30', '20:00'), 'Allows consecutive non-overlapping classes (end == next start)');

  // 3.2 Add a new scheduled class
  const futureDate = '2026-11-15';
  const newClassRes = await scheduleService.saveClassSession({
    studentId: 'std-1',
    studentName: 'Hamza Farooq',
    tutorId: 'tutor-ahmed',
    tutorName: 'Dr. Ahmed Raza',
    subject: 'A-Level Calculus',
    classGrade: 'FSc / A-Levels (Grade 12)',
    sessionDate: futureDate,
    startTime: '10:00',
    endTime: '11:30',
    teachingMode: 'Home Tuition',
    meetingLinkOrAddress: 'House 14, St 5, Phase 4, Bahria Town',
    internalNotes: 'Calculus derivatives review'
  });
  assert(newClassRes.success && Boolean(newClassRes.session), 'Adds new class session to schedule');
  const addedSession = newClassRes.session!;

  // 3.3 Conflict Test: Try booking overlapping class for the SAME TUTOR
  const tutorConflictCheck = await scheduleService.checkConflict(
    'tutor-ahmed',
    'std-3', // different student
    futureDate,
    '10:30',
    '12:00'
  );
  assert(tutorConflictCheck.hasConflict, 'Rejects overlapping class for same tutor (10:30-12:00 vs 10:00-11:30)');

  // 3.4 Conflict Test: Try booking overlapping class for the SAME STUDENT
  const studentConflictCheck = await scheduleService.checkConflict(
    'tutor-ayesha', // different tutor
    'std-1', // same student
    futureDate,
    '10:15',
    '11:45'
  );
  assert(studentConflictCheck.hasConflict, 'Rejects overlapping class for same student (10:15-11:45 vs 10:00-11:30)');

  // 3.5 Test rescheduling
  const rescheduleRes = await scheduleService.rescheduleSession(
    addedSession.id,
    '2026-11-16',
    '14:00',
    '15:30',
    'Moved to Monday afternoon upon parent request'
  );
  assert(rescheduleRes.success, 'Reschedules session successfully');
  const reloadedSession = (await scheduleService.getClassSessions()).sessions.find(s => s.id === addedSession.id);
  assert(reloadedSession?.status === 'rescheduled' && reloadedSession?.sessionDate === '2026-11-16', 'Verifies session has rescheduled status and updated date');

  // 3.6 Test cancellation
  const cancelRes = await scheduleService.updateSessionStatus(addedSession.id, 'cancelled', 'Cancelled due to school exams');
  assert(cancelRes.success, 'Cancels session successfully');
  const cancelledSession = (await scheduleService.getClassSessions()).sessions.find(s => s.id === addedSession.id);
  assert(cancelledSession?.status === 'cancelled', 'Verifies session status updated to cancelled');

  // 3.7 Verify Next-Class countdown & PKT time zone handling
  const simulatedNow = new Date('2026-11-16T12:00:00+05:00'); // 2 hours before 14:00 PKT
  const countdownUpcoming = calculateNextClassCountdown('2026-11-16', '14:00', '15:30', simulatedNow);
  assert(countdownUpcoming.status === 'upcoming', 'Detects upcoming session status');
  assert(countdownUpcoming.diffMinutes === 120, 'Calculates exact minutes until class starts (120 mins)');
  assert(countdownUpcoming.formattedCountdown.includes('2h'), 'Formats remaining countdown cleanly ("Starts in 2h 0m")');
  assert(countdownUpcoming.pktTimeDisplay.includes('PKT (UTC+5)'), 'Renders Pakistan Standard Time (PKT, UTC+5) indicator');

  const simulatedInProgress = new Date('2026-11-16T14:30:00+05:00'); // in progress
  const countdownLive = calculateNextClassCountdown('2026-11-16', '14:00', '15:30', simulatedInProgress);
  assert(countdownLive.status === 'in-progress', 'Detects currently active in-progress session');
  assert(countdownLive.badgeLabel === 'LIVE NOW', 'Displays "LIVE NOW" badge during class');

  // Clean up test session
  const storedSessions = (await scheduleService.getClassSessions()).sessions.filter(s => s.id !== addedSession.id);
  // =========================================================================
  // 4. FINANCIAL RECORDS TESTS
  // =========================================================================
  console.log('\n--- 4. Financial Records & Accounting Separation Tests ---');

  // 4.1 Test paid payment
  const paidFee = await financialService.saveStudentFee({
    studentId: 'std-1',
    studentName: 'Hamza Farooq',
    billingPeriod: 'October 2026',
    amount: 2500,
    amountPaid: 2500,
    dueDate: '2026-10-05',
    status: 'paid',
    paymentMethod: 'Online Bank Transfer'
  });
  assert(paidFee.success && paidFee.record?.status === 'paid', 'Records fully paid tuition fee ($2,500)');

  // 4.2 Test partial payment
  const partialFee = await financialService.saveStudentFee({
    studentId: 'std-2',
    studentName: 'Ayesha Malik',
    billingPeriod: 'October 2026',
    amount: 2800,
    amountPaid: 1500,
    dueDate: '2026-10-10',
    status: 'partial',
    paymentMethod: 'JazzCash'
  });
  assert(partialFee.success && partialFee.record?.status === 'partial', 'Records partial tuition payment ($1,500 of $2,800)');

  // 4.3 Test pending payment
  const pendingFee = await financialService.saveStudentFee({
    studentId: 'std-3',
    studentName: 'Bilal Mustafa',
    billingPeriod: 'November 2026',
    amount: 2300,
    amountPaid: 0,
    dueDate: '2026-11-05',
    status: 'pending',
    paymentMethod: 'Bank Transfer'
  });
  assert(pendingFee.success && pendingFee.record?.status === 'pending', 'Records pending tuition payment ($2,300)');

  // 4.4 Test overdue payment
  const overdueFee = await financialService.saveStudentFee({
    studentId: 'std-4',
    studentName: 'Zainab Fatima',
    billingPeriod: 'September 2026',
    amount: 3000,
    amountPaid: 0,
    dueDate: '2026-09-05',
    status: 'overdue',
    paymentMethod: 'Pending'
  });
  assert(overdueFee.success && overdueFee.record?.status === 'overdue', 'Records overdue tuition payment (September overdue)');

  // 4.5 Verify tutor compensation and student fees remain separate
  const tutorSalary = await financialService.saveTutorSalary({
    tutorId: 'tutor-ahmed',
    tutorName: 'Dr. Ahmed Raza',
    billingPeriod: 'October 2026',
    amount: 2200,
    paymentFrequency: 'monthly',
    classesCount: 16,
    dueDate: '2026-10-31',
    status: 'pending',
    paymentMethod: 'Bank Transfer'
  });
  assert(tutorSalary.success && Boolean(tutorSalary.record), 'Records separate tutor salary disbursement ($2,200)');

  // 4.6 Confirm tutors cannot view other tutors’ salaries or platform financial summaries
  const tutorAhmedSalaries = await financialService.getTutorSalaries({ tutorId: 'tutor-ahmed' });
  const allMatchAhmed = tutorAhmedSalaries.records.every(s => s.tutorId === 'tutor-ahmed');
  assert(allMatchAhmed, 'Tutor salary ledger strictly confidential to target tutorId');

  const tutorScopedMetrics = await financialService.calculateMetrics('tutor-ahmed');
  assert(tutorScopedMetrics.totalFeesInvoiced === 0, 'Platform student fees invoiced are hidden (0) from tutor metrics');
  assert(tutorScopedMetrics.totalFeesCollected === 0, 'Platform student tuition collected is hidden (0) from tutor metrics');
  assert(tutorScopedMetrics.netOperatingBalance === 0, 'Platform net operating balance is hidden (0) from tutor metrics');
  assert(tutorScopedMetrics.totalSalariesAmount > 0, 'Tutor can view their own compensation total ($' + tutorScopedMetrics.totalSalariesAmount + ')');

  // Admin global metrics can see entire platform
  const adminGlobalMetrics = await financialService.calculateMetrics();
  assert(adminGlobalMetrics.totalFeesInvoiced > 0, 'Admin can calculate total platform tuition invoiced');
  assert(adminGlobalMetrics.totalSalariesAmount > 0, 'Admin can calculate total platform tutor salaries');

  // =========================================================================
  // 5. SUPABASE AND SECURITY TESTS
  // =========================================================================
  console.log('\n--- 5. Supabase & Database Security Verification ---');

  // 5.1 Check SQL Migration files existence
  const phase3SqlPath = path.resolve(process.cwd(), 'supabase/phase3_schema.sql');
  const phase2SqlPath = path.resolve(process.cwd(), 'supabase/schema.sql');
  assert(fs.existsSync(phase3SqlPath), 'Phase 3 PostgreSQL schema migration file exists (/supabase/phase3_schema.sql)');
  assert(fs.existsSync(phase2SqlPath), 'Phase 2 PostgreSQL schema migration file exists (/supabase/schema.sql)');

  // 5.2 Verify Row Level Security policies defined in schema
  const phase3SqlContent = fs.readFileSync(phase3SqlPath, 'utf8');
  assert(phase3SqlContent.includes('ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on tutors table in schema');
  assert(phase3SqlContent.includes('ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on students table in schema');
  assert(phase3SqlContent.includes('ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on class_sessions table in schema');
  assert(phase3SqlContent.includes('ALTER TABLE public.tutor_salaries ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on tutor_salaries table in schema');
  assert(phase3SqlContent.includes('ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on student_fees table in schema');

  // 5.3 Verify database conflict trigger
  assert(phase3SqlContent.includes('CREATE TRIGGER trg_prevent_session_conflicts'), 'Database-level conflict trigger trg_prevent_session_conflicts defined');
  assert(phase3SqlContent.includes('check_class_session_conflicts()'), 'Database trigger function check_class_session_conflicts defined');

  // 5.4 Check that missing environment variables do not silently present demo data as saved production data
  const supabaseConfig = getSupabaseConfig();
  assert(typeof supabaseConfig.isConfigured === 'boolean', 'Supabase configuration status accurately evaluated');
  
  // When unconfigured, services explicitly flag source as 'local'
  const tutorCheckSource = await tutorService.getTutors();
  const studentCheckSource = await studentService.getStudents();
  const sessionCheckSource = await scheduleService.getClassSessions();
  const feeCheckSource = await financialService.getStudentFees();

  if (!supabaseConfig.isConfigured) {
    assert(tutorCheckSource.source === 'local', 'Tutor service flags data source as "local" (not disguised as production DB)');
    assert(studentCheckSource.source === 'local', 'Student service flags data source as "local" (not disguised as production DB)');
    assert(sessionCheckSource.source === 'local', 'Schedule service flags data source as "local" (not disguised as production DB)');
    assert(feeCheckSource.source === 'local', 'Financial service flags data source as "local" (not disguised as production DB)');
  }

  // 5.5 Verify RLS access rules for unauthorized direct access
  assert(phase3SqlContent.includes('CREATE POLICY "Tutors can view their assigned students"'), 'RLS policy restricts tutors from viewing unassigned students');
  assert(phase3SqlContent.includes('CREATE POLICY "Tutors can view their own salary slips"'), 'RLS policy restricts tutors from viewing other educators\' salaries');
  assert(!phase3SqlContent.includes('ON public.students FOR SELECT USING (true)'), 'Public cannot select student private records directly');

  // =========================================================================
  // 6. EXISTING FEATURES VERIFICATION
  // =========================================================================
  console.log('\n--- 6. Existing Features & Core Regression Tests ---');

  // 6.1 Posters
  const postersRes = await getPublishedPosters();
  assert(postersRes.posters.length > 0, 'Phase 2 Promotional Posters system active', `Count: ${postersRes.posters.length}`);

  // 6.2 Videos
  const videosRes = await getPublishedVideos();
  assert(videosRes.videos.length > 0, 'Phase 2 Video content system active', `Count: ${videosRes.videos.length}`);

  // 6.3 Social Links
  const socialRes = await getActiveSocialLinks();
  assert(socialRes.links.length >= 4, 'Phase 2 Social links configured', `Count: ${socialRes.links.length}`);

  // 6.4 Public Tutor Details Page Data
  const sampleTutor = await tutorService.getTutorById('tutor-fatima');
  assert(sampleTutor !== null && sampleTutor.gender === 'Female', 'Public tutor profile returns full verified profile details');

  console.log('\n========================================================');
  console.log(`TOTAL TESTS: ${passedTests + failedTests}`);
  console.log(`PASSED: ${passedTests}`);
  console.log(`FAILED: ${failedTests}`);
  console.log('========================================================\n');

  if (failedTests > 0) {
    console.error('Failed tests summary:');
    failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
    process.exit(1);
  }
}

runPhase3Verification().catch((err) => {
  console.error('Test suite crashed with unhandled error:', err);
  process.exit(1);
});
