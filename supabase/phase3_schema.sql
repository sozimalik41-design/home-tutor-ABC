-- ====================================================================
-- HOME TUTOR PHASE 3: TUTOR MANAGEMENT, STUDENT RECORDS & SCHEDULE SCHEMA
-- (100% Idempotent and Non-Destructive: Safe to re-run multiple times)
-- ====================================================================

-- 1. Create Tutors Table
CREATE TABLE IF NOT EXISTS public.tutors (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'Prefer not to say' CHECK (gender IN ('Male', 'Female', 'Prefer not to say')),
  avatar TEXT,
  title TEXT NOT NULL DEFAULT 'Professional Educator',
  qualification TEXT NOT NULL,
  university TEXT,
  experience_years INT NOT NULL DEFAULT 0,
  subjects TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  classes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  mode TEXT[] NOT NULL DEFAULT ARRAY['In-Person', 'Online'],
  city TEXT NOT NULL DEFAULT 'Lahore',
  teaching_area TEXT,
  hourly_rate NUMERIC NOT NULL DEFAULT 25 CHECK (hourly_rate >= 0),
  salary_amount NUMERIC NOT NULL DEFAULT 0 CHECK (salary_amount >= 0),
  salary_frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (salary_frequency IN ('monthly', 'per_class', 'hourly')),
  student_tuition_fee NUMERIC NOT NULL DEFAULT 0 CHECK (student_tuition_fee >= 0),
  currency TEXT NOT NULL DEFAULT '$',
  rating NUMERIC NOT NULL DEFAULT 5.0,
  review_count INT NOT NULL DEFAULT 0,
  bio TEXT,
  teaching_approach TEXT,
  availability TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('active', 'inactive', 'pending', 'verified')),
  featured BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on tutors
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;

-- Tutors RLS Policies:
DROP POLICY IF EXISTS "Public users can view verified tutors" ON public.tutors;
CREATE POLICY "Public users can view verified tutors"
  ON public.tutors FOR SELECT
  USING (status IN ('verified', 'active'));

DROP POLICY IF EXISTS "Admins can view all tutors" ON public.tutors;
CREATE POLICY "Admins can view all tutors"
  ON public.tutors FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert tutors" ON public.tutors;
CREATE POLICY "Admins can insert tutors"
  ON public.tutors FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins and tutors can update tutor profiles" ON public.tutors;
CREATE POLICY "Admins and tutors can update tutor profiles"
  ON public.tutors FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete tutors" ON public.tutors;
CREATE POLICY "Admins can delete tutors"
  ON public.tutors FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. Create Students Table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  subjects TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  assigned_tutor_id TEXT REFERENCES public.tutors(id) ON DELETE SET NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT,
  city TEXT NOT NULL DEFAULT 'Lahore',
  address TEXT,
  teaching_mode TEXT NOT NULL DEFAULT 'Home Tuition' CHECK (teaching_mode IN ('Home Tuition', 'Online', 'Hybrid')),
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'paused')),
  monthly_fee NUMERIC NOT NULL DEFAULT 0 CHECK (monthly_fee >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on students (Strict privacy: never public)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
CREATE POLICY "Admins can view all students"
  ON public.students FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Tutors can view their assigned students" ON public.students;
CREATE POLICY "Tutors can view their assigned students"
  ON public.students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tutors 
      WHERE tutors.id = students.assigned_tutor_id AND tutors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students and parents can view their own record" ON public.students;
CREATE POLICY "Students and parents can view their own record"
  ON public.students FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can insert students" ON public.students;
CREATE POLICY "Admins can insert students"
  ON public.students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update students" ON public.students;
CREATE POLICY "Admins can update students"
  ON public.students FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete students" ON public.students;
CREATE POLICY "Admins can delete students"
  ON public.students FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Create Class Sessions Table
CREATE TABLE IF NOT EXISTS public.class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  tutor_id TEXT NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  class_grade TEXT NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  teaching_mode TEXT NOT NULL DEFAULT 'Home Tuition' CHECK (teaching_mode IN ('Home Tuition', 'Online', 'Hybrid')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  meeting_link_or_address TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_end_after_start CHECK (end_time > start_time)
);

-- Enable RLS on class_sessions
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all class sessions" ON public.class_sessions;
CREATE POLICY "Admins can manage all class sessions"
  ON public.class_sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Tutors can view and update their own class sessions" ON public.class_sessions;
CREATE POLICY "Tutors can view and update their own class sessions"
  ON public.class_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tutors 
      WHERE tutors.id = class_sessions.tutor_id AND tutors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Tutors can update their own class sessions" ON public.class_sessions;
CREATE POLICY "Tutors can update their own class sessions"
  ON public.class_sessions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tutors 
      WHERE tutors.id = class_sessions.tutor_id AND tutors.user_id = auth.uid()
    )
  )
  WITH CHECK (true);

DROP POLICY IF EXISTS "Students can view their own scheduled sessions" ON public.class_sessions;
CREATE POLICY "Students can view their own scheduled sessions"
  ON public.class_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE students.id = class_sessions.student_id AND students.user_id = auth.uid()
    )
  );

-- Database Level Conflict Prevention Trigger Function
CREATE OR REPLACE FUNCTION public.check_class_session_conflicts()
RETURNS TRIGGER AS $$
DECLARE
  conflict_count INT;
BEGIN
  -- Only validate conflicts for scheduled sessions
  IF NEW.status != 'scheduled' AND NEW.status != 'rescheduled' THEN
    RETURN NEW;
  END IF;

  -- 1. Check Tutor conflict: No overlapping session for same tutor on same date
  SELECT COUNT(*) INTO conflict_count
  FROM public.class_sessions
  WHERE tutor_id = NEW.tutor_id
    AND session_date = NEW.session_date
    AND status IN ('scheduled', 'rescheduled')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
      (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
      (NEW.start_time <= start_time AND NEW.end_time >= end_time)
    );

  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'Schedule conflict: Tutor already has another scheduled session during this time slot on this date.';
  END IF;

  -- 2. Check Student conflict: No overlapping session for same student on same date
  SELECT COUNT(*) INTO conflict_count
  FROM public.class_sessions
  WHERE student_id = NEW.student_id
    AND session_date = NEW.session_date
    AND status IN ('scheduled', 'rescheduled')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
      (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
      (NEW.start_time <= start_time AND NEW.end_time >= end_time)
    );

  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'Schedule conflict: Student already has another scheduled session during this time slot on this date.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_session_conflicts ON public.class_sessions;
CREATE TRIGGER trg_prevent_session_conflicts
  BEFORE INSERT OR UPDATE ON public.class_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_class_session_conflicts();

-- 4. Create Tutor Salary Compensation Records Table
CREATE TABLE IF NOT EXISTS public.tutor_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id TEXT NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  billing_period TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  payment_frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (payment_frequency IN ('monthly', 'per_class', 'hourly')),
  classes_count INT NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  payment_method TEXT DEFAULT 'Bank Transfer',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on tutor_salaries
ALTER TABLE public.tutor_salaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all tutor salaries" ON public.tutor_salaries;
CREATE POLICY "Admins can manage all tutor salaries"
  ON public.tutor_salaries FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Tutors can view their own salary slips" ON public.tutor_salaries;
CREATE POLICY "Tutors can view their own salary slips"
  ON public.tutor_salaries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tutors 
      WHERE tutors.id = tutor_salaries.tutor_id AND tutors.user_id = auth.uid()
    )
  );

-- 5. Create Student Tuition Fee Charges Table
CREATE TABLE IF NOT EXISTS public.student_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  billing_period TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  amount_paid NUMERIC NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
  payment_method TEXT DEFAULT 'Online Bank Deposit',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on student_fees
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all student fees" ON public.student_fees;
CREATE POLICY "Admins can manage all student fees"
  ON public.student_fees FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Students and parents can view their own fee charges" ON public.student_fees;
CREATE POLICY "Students and parents can view their own fee charges"
  ON public.student_fees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE students.id = student_fees.student_id AND students.user_id = auth.uid()
    )
  );

-- 6. Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_tutors_status_gender ON public.tutors (status, gender);
CREATE INDEX IF NOT EXISTS idx_tutors_city ON public.tutors (city);
CREATE INDEX IF NOT EXISTS idx_students_tutor_status ON public.students (assigned_tutor_id, status);
CREATE INDEX IF NOT EXISTS idx_sessions_tutor_date ON public.class_sessions (tutor_id, session_date, start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_student_date ON public.class_sessions (student_id, session_date, start_time);
CREATE INDEX IF NOT EXISTS idx_tutor_salaries_tutor ON public.tutor_salaries (tutor_id, status);
CREATE INDEX IF NOT EXISTS idx_student_fees_student ON public.student_fees (student_id, status);

-- Timezone note:
-- All session dates and times are stored and rendered based on Pakistan Standard Time (PKT, UTC+5).
