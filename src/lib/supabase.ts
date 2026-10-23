import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
  dotenv.config();
}

// Support both standard VITE_ env prefixes and Node process.env
const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || 
  '';

const supabaseKey = 
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) || 
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) || 
  '';

/**
 * Validates whether the Supabase key is an active, valid key rather than a placeholder.
 * Supports both:
 * 1. Current Supabase Publishable Key format (`sb_publishable_...`)
 * 2. Legacy Supabase Anon JWT format (`eyJ...`)
 */
export function detectKeyFormat(key: string): 'publishable' | 'jwt' | 'placeholder' | 'none' {
  if (!key || !key.trim()) return 'none';
  const clean = key.trim();
  
  if (
    clean === 'your-anon-key' ||
    clean === 'YOUR_SUPABASE_PUBLISHABLE_KEY' ||
    clean === 'YOUR_KEY_HERE' ||
    clean.includes('YOUR_') ||
    clean.length < 20
  ) {
    return 'placeholder';
  }

  if (clean.startsWith('sb_publishable_')) {
    return 'publishable';
  }

  if (clean.startsWith('eyJ')) {
    return 'jwt';
  }

  // Generic valid token > 20 chars
  return clean.length >= 30 ? 'publishable' : 'placeholder';
}

export const isSupabaseConfigured = (): boolean => {
  const cleanUrl = (supabaseUrl || '').trim();
  const format = detectKeyFormat(supabaseKey);

  return Boolean(
    cleanUrl &&
    cleanUrl.startsWith('https://') &&
    cleanUrl.includes('.supabase.co') &&
    !cleanUrl.includes('your-project') &&
    format !== 'none' &&
    format !== 'placeholder'
  );
};

export const getSupabaseConfig = () => {
  const keyFormat = detectKeyFormat(supabaseKey);
  const isConfigured = isSupabaseConfigured();

  return {
    url: (supabaseUrl || '').trim(),
    projectRef: (supabaseUrl || '').match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1] || '',
    isConfigured,
    hasKey: keyFormat !== 'none',
    isPlaceholderKey: keyFormat === 'placeholder',
    keyFormat
  };
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl.trim(), supabaseKey.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'x-client-info': 'home-tutor-v4'
        }
      }
    });
  }

  return clientInstance;
};

// Fallback dummy client for typing when needed
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl.trim(), supabaseKey.trim())
  : (null as unknown as SupabaseClient);

/**
 * Diagnostic interface for live database testing
 */
export interface SupabaseLiveTestResult {
  isConfigured: boolean;
  projectUrl: string;
  projectRef: string;
  keyFormat: 'publishable' | 'jwt' | 'placeholder' | 'none';
  canReachEndpoint: boolean;
  isAuthenticated: boolean;
  tablesStatus: Record<string, { exists: boolean; rowCount?: number; error?: string }>;
  allTablesReady: boolean;
  migrationsRequired: string[];
  summaryMessage: string;
}

/**
 * Live test function to verify actual Supabase reads and table availability
 */
export async function testLiveSupabaseConnection(): Promise<SupabaseLiveTestResult> {
  const config = getSupabaseConfig();
  const result: SupabaseLiveTestResult = {
    isConfigured: config.isConfigured,
    projectUrl: config.url,
    projectRef: config.projectRef,
    keyFormat: config.keyFormat,
    canReachEndpoint: false,
    isAuthenticated: false,
    tablesStatus: {},
    allTablesReady: false,
    migrationsRequired: [],
    summaryMessage: ''
  };

  // If not configured with a valid key, report honestly
  if (!config.isConfigured) {
    result.summaryMessage = config.isPlaceholderKey
      ? `Supabase project URL is set to "${config.url}", but VITE_SUPABASE_ANON_KEY contains a placeholder ("${config.keyFormat}"). Client safely running in Local Persistence Fallback mode.`
      : 'Supabase URL or Key not set in environment. Running in Local Persistence Fallback mode.';
    return result;
  }

  const client = getSupabaseClient();
  if (!client) {
    result.summaryMessage = 'Supabase client could not be initialized.';
    return result;
  }

  const tablesToCheck = [
    'tutors',
    'students',
    'class_sessions',
    'tutor_salaries',
    'student_fees',
    'posters',
    'videos',
    'social_links',
    'profiles'
  ];

  let anyTableSuccess = false;
  let missingTablesCount = 0;

  for (const table of tablesToCheck) {
    try {
      const { data, count, error } = await client
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        // Table not found code in PostgREST is 42P01 or relation does not exist
        const isMissing = error.message?.includes('relation') || error.code === '42P01' || error.message?.includes('does not exist');
        result.tablesStatus[table] = {
          exists: false,
          error: error.message
        };
        if (isMissing) {
          missingTablesCount++;
        }
      } else {
        result.canReachEndpoint = true;
        result.isAuthenticated = true;
        anyTableSuccess = true;
        result.tablesStatus[table] = {
          exists: true,
          rowCount: count ?? (Array.isArray(data) ? data.length : 0)
        };
      }
    } catch (err: any) {
      result.tablesStatus[table] = {
        exists: false,
        error: err?.message || 'Network exception'
      };
    }
  }

  if (missingTablesCount > 0) {
    if (result.tablesStatus['tutors']?.exists === false || result.tablesStatus['students']?.exists === false) {
      result.migrationsRequired.push('/supabase/phase3_schema.sql');
    }
    if (result.tablesStatus['posters']?.exists === false || result.tablesStatus['videos']?.exists === false) {
      result.migrationsRequired.push('/supabase/schema.sql');
    }
  }

  result.allTablesReady = anyTableSuccess && missingTablesCount === 0;

  if (result.allTablesReady) {
    result.summaryMessage = `Successfully connected to Supabase (${config.url}). All ${tablesToCheck.length} tables verified.`;
  } else if (anyTableSuccess) {
    result.summaryMessage = `Connected to Supabase, but ${missingTablesCount} tables are missing. Migrations required: ${result.migrationsRequired.join(', ')}`;
  } else {
    result.summaryMessage = `Could not query tables on ${config.url}. Check key permissions and ensure SQL migrations are applied in Supabase dashboard.`;
  }

  return result;
}
