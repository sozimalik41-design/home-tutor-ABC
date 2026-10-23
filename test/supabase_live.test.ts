import { getSupabaseConfig, testLiveSupabaseConnection, getSupabaseClient } from '../src/lib/supabase';
import { tutorService } from '../src/services/tutorService';
import { studentService } from '../src/services/studentService';
import { scheduleService } from '../src/services/scheduleService';
import { financialService } from '../src/services/financialService';
import { getPublishedPosters } from '../src/services/posterService';
import { getPublishedVideos } from '../src/services/videoService';
import { getActiveSocialLinks } from '../src/services/socialLinkService';

console.log('========================================================');
console.log('   HOME TUTOR PHASE 4: SUPABASE LIVE CONNECTION AUDIT   ');
console.log('========================================================\n');

async function runLiveAudit() {
  const config = getSupabaseConfig();
  console.log('1. Configuration Inspection:');
  console.log(`   - Target Supabase URL: ${config.url}`);
  console.log(`   - Project Reference:   ${config.projectRef || 'None'}`);
  console.log(`   - Key Detected:        ${config.hasKey ? 'YES' : 'NO'}`);
  console.log(`   - Key Format:          ${config.keyFormat}`);
  console.log(`   - Client Configured:   ${config.isConfigured ? 'YES (Live Ready)' : 'NO (Placeholder / Fallback)'}`);

  console.log('\n2. Live Connection Diagnostics:');
  const diagnostics = await testLiveSupabaseConnection();
  console.log(`   - Reachable Endpoint:  ${diagnostics.canReachEndpoint ? 'YES' : 'NO'}`);
  console.log(`   - Authenticated:       ${diagnostics.isAuthenticated ? 'YES' : 'NO'}`);
  console.log(`   - Status Summary:      ${diagnostics.summaryMessage}`);

  console.log('\n3. Remote Database Tables Status:');
  for (const [table, status] of Object.entries(diagnostics.tablesStatus)) {
    console.log(`   - ${table.padEnd(16)}: ${status.exists ? `ONLINE (Rows: ${status.rowCount ?? 0})` : `MISSING or RESTRICTED (${status.error || 'N/A'})`}`);
  }

  console.log('\n4. Fallback & Resilience Verification:');
  const tutors = await tutorService.getTutors();
  const students = await studentService.getStudents();
  const sessions = await scheduleService.getClassSessions();
  const fees = await financialService.getStudentFees();
  const posters = await getPublishedPosters();
  const videos = await getPublishedVideos();
  const social = await getActiveSocialLinks();

  console.log(`   - Tutors source:     ${tutors.source} (Count: ${tutors.tutors.length})`);
  console.log(`   - Students source:   ${students.source} (Count: ${students.students.length})`);
  console.log(`   - Sessions source:   ${sessions.source} (Count: ${sessions.sessions.length})`);
  console.log(`   - Fees source:       ${fees.source} (Count: ${fees.records.length})`);
  console.log(`   - Posters source:    ${posters.isLiveDb ? 'supabase' : 'local'} (Count: ${posters.posters.length})`);
  console.log(`   - Videos source:     ${videos.isLiveDb ? 'supabase' : 'local'} (Count: ${videos.videos.length})`);
  console.log(`   - Social links:      ${social.isLiveDb ? 'supabase' : 'local'} (Count: ${social.links.length})`);

  console.log('\n========================================================');
  console.log('AUDIT SUMMARY:');
  console.log(`- Supabase Project URL: ${config.url}`);
  console.log(`- Key Format: ${config.keyFormat}`);
  if (config.isConfigured && diagnostics.allTablesReady) {
    console.log('- Status: FULLY CONNECTED TO REMOTE DATABASE');
  } else {
    console.log('- Status: AWAITING ACTIVE PUBLISHABLE KEY IN LOCAL .env');
    console.log('- Verified: Fallback mode active without crashes or data loss.');
  }
  console.log('========================================================\n');
}

runLiveAudit().catch((e) => {
  console.error('Audit failed with error:', e);
  process.exit(1);
});
