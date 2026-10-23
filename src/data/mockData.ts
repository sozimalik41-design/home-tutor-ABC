import { 
  Tutor, 
  Poster, 
  VideoContent, 
  Testimonial, 
  SubjectCategory,
  Student,
  ClassSession,
  TutorSalaryRecord,
  StudentFeeRecord 
} from '../types';

const heroImg = new URL('../assets/images/hero_tutoring_session_1791955254850.jpg', import.meta.url).href;
const tutorSarahImg = new URL('../assets/images/tutor_sarah_1791955280410.jpg', import.meta.url).href;
const tutorAhmedImg = new URL('../assets/images/tutor_ahmed_1791955307778.jpg', import.meta.url).href;
const tutorFatimaImg = new URL('../assets/images/tutor_fatima_1791955343926.jpg', import.meta.url).href;
const posterTutorHiringImg = new URL('../assets/images/poster_tutor_hiring_1792142266938.jpg', import.meta.url).href;
const posterAcademicImg = new URL('../assets/images/poster_academic_1791955386070.jpg', import.meta.url).href;
const posterStemMathImg = new URL('../assets/images/poster_stem_math_1792142184206.jpg', import.meta.url).href;
const posterPrimaryReadingImg = new URL('../assets/images/poster_primary_reading_1792142246975.jpg', import.meta.url).href;
const posterMedicalMdcatImg = new URL('../assets/images/poster_medical_mdcat_1792142226423.jpg', import.meta.url).href;
const posterCodingRoboticsImg = new URL('../assets/images/poster_coding_robotics_1792142206717.jpg', import.meta.url).href;
const posterEnglishIeltsImg = new URL('../assets/images/poster_english_ielts_1792142288981.jpg', import.meta.url).href;
const posterChemistryLabImg = new URL('../assets/images/poster_chemistry_lab_1792142308078.jpg', import.meta.url).href;
const posterEngineeringEcatImg = new URL('../assets/images/poster_engineering_ecat_1792142330069.jpg', import.meta.url).href;
const posterUrduHumanitiesImg = new URL('../assets/images/poster_urdu_humanities_1792142350133.jpg', import.meta.url).href;

export const HERO_IMAGE = heroImg;

export const POPULAR_SUBJECTS: SubjectCategory[] = [
  {
    id: 'math',
    name: 'Mathematics',
    tutorCount: 142,
    iconName: 'Calculator',
    popularTopics: ['Algebra', 'Calculus', 'Trigonometry', 'Geometry', 'Statistics']
  },
  {
    id: 'physics',
    name: 'Physics',
    tutorCount: 98,
    iconName: 'Atom',
    popularTopics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics']
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    tutorCount: 86,
    iconName: 'FlaskConical',
    popularTopics: ['Organic Chemistry', 'Inorganic Chemistry', 'Stoichiometry', 'Biochemistry']
  },
  {
    id: 'biology',
    name: 'Biology & Life Sciences',
    tutorCount: 79,
    iconName: 'Dna',
    popularTopics: ['Cell Biology', 'Genetics', 'Human Physiology', 'Ecology']
  },
  {
    id: 'english',
    name: 'English & Literature',
    tutorCount: 115,
    iconName: 'BookOpen',
    popularTopics: ['Grammar & Composition', 'Creative Writing', 'IELTS / TOEFL', 'Literature']
  },
  {
    id: 'cs',
    name: 'Computer Science & Coding',
    tutorCount: 64,
    iconName: 'Code',
    popularTopics: ['Python', 'Web Development', 'Data Structures', 'Scratch for Kids']
  },
  {
    id: 'economics',
    name: 'Economics & Commerce',
    tutorCount: 52,
    iconName: 'TrendingUp',
    popularTopics: ['Microeconomics', 'Macroeconomics', 'Accounting', 'Business Studies']
  },
  {
    id: 'languages',
    name: 'Languages & Linguistics',
    tutorCount: 71,
    iconName: 'Languages',
    popularTopics: ['Urdu', 'Arabic', 'French', 'Spanish', 'Mandarin']
  }
];

export const CITIES = [
  'All Cities',
  'Sadiqabad',
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Online Only'
];

export const CLASSES_LEVELS = [
  'All Classes',
  'Primary (Grade 1 - 5)',
  'Middle School (Grade 6 - 8)',
  'Matric / O-Levels (Grade 9 - 10)',
  'FSc / A-Levels (Grade 11 - 12)',
  'Entry Test (MDCAT / ECAT / SAT)',
  'University Undergraduate'
];

export const TUTORS_LIST: Tutor[] = [
  {
    id: 'tutor-sarah',
    name: 'Sarah Jenkins',
    gender: 'Female',
    avatar: tutorSarahImg,
    title: 'Senior English & Humanities Specialist',
    qualification: 'M.Phil in English Literature & Applied Linguistics',
    university: 'University of Cambridge / Oxford Scholar',
    experienceYears: 8,
    rating: 4.9,
    reviewCount: 48,
    hourlyRate: 25,
    salaryAmount: 1800,
    salaryFrequency: 'monthly',
    studentTuitionFee: 2200,
    currency: '$',
    subjects: ['English & Literature', 'Creative Writing', 'IELTS / TOEFL', 'History'],
    classes: ['Middle School (Grade 6 - 8)', 'Matric / O-Levels (Grade 9 - 10)', 'FSc / A-Levels (Grade 11 - 12)'],
    cities: ['Lahore', 'Islamabad', 'Online Only'],
    teachingArea: 'DHA, Gulberg & Model Town',
    mode: ['In-Person', 'Online', 'Hybrid'],
    bio: 'Dedicated educator with over 8 years experience mentoring high school and O/A-Level students. Passionate about critical reading, academic essay structure, and helping students excel in standardized exams.',
    teachingApproach: 'Diagnostic diagnostic tests, custom revision plans, and conversational essay breakdowns.',
    featured: true,
    verified: true,
    status: 'verified',
    availability: ['Monday 4:00 PM - 7:00 PM', 'Wednesday 4:00 PM - 7:00 PM', 'Saturday 10:00 AM - 2:00 PM'],
    badges: ['Top Rated Tutor 2026', 'Background Checked', 'O/A Level Expert']
  },
  {
    id: 'tutor-ahmed',
    name: 'Dr. Ahmed Raza',
    gender: 'Male',
    avatar: tutorAhmedImg,
    title: 'Advanced Mathematics & Calculus Coach',
    qualification: 'Ph.D. in Applied Mathematics & Mathematical Modeling',
    university: 'Imperial College London & LUMS Alum',
    experienceYears: 10,
    rating: 5.0,
    reviewCount: 62,
    hourlyRate: 35,
    salaryAmount: 2400,
    salaryFrequency: 'monthly',
    studentTuitionFee: 3000,
    currency: '$',
    subjects: ['Mathematics', 'Physics', 'Computer Science & Coding'],
    classes: ['Matric / O-Levels (Grade 9 - 10)', 'FSc / A-Levels (Grade 11 - 12)', 'Entry Test (MDCAT / ECAT / SAT)', 'University Undergraduate'],
    cities: ['Islamabad', 'Rawalpindi', 'Online Only'],
    teachingArea: 'F-7, F-8, E-11 & Bahria Town',
    mode: ['In-Person', 'Online', 'Hybrid'],
    bio: 'Specialist in making pure and applied math intuitive and enjoyable. Helped 150+ students secure A* grades in Edexcel, Cambridge CAIE, and national board examinations.',
    teachingApproach: 'Concept-first visual derivations, past-paper intensive mastery, and regular timed mock trials.',
    featured: true,
    verified: true,
    status: 'verified',
    availability: ['Tuesday 5:00 PM - 8:00 PM', 'Thursday 5:00 PM - 8:00 PM', 'Sunday 11:00 AM - 3:00 PM'],
    badges: ['100% Pass Rate', 'Verified Credentials', 'SAT Math 800 Mentor']
  },
  {
    id: 'tutor-fatima',
    name: 'Fatima Zahra',
    gender: 'Female',
    avatar: tutorFatimaImg,
    title: 'Biology & Medical Entry Test Specialist',
    qualification: 'MBBS, Certified Pre-Med Educator',
    university: 'King Edward Medical University',
    experienceYears: 6,
    rating: 4.8,
    reviewCount: 39,
    hourlyRate: 28,
    salaryAmount: 2000,
    salaryFrequency: 'monthly',
    studentTuitionFee: 2500,
    currency: '$',
    subjects: ['Biology & Life Sciences', 'Chemistry'],
    classes: ['Matric / O-Levels (Grade 9 - 10)', 'FSc / A-Levels (Grade 11 - 12)', 'Entry Test (MDCAT / ECAT / SAT)'],
    cities: ['Lahore', 'Faisalabad', 'Online Only'],
    teachingArea: 'Johar Town, Faisal Town & Model Town',
    mode: ['In-Person', 'Online'],
    bio: 'Medical graduate with extensive teaching experience for MDCAT, Cambridge CAIE Biology, and A-Level Sciences. Known for mnemonics and high-yield diagrammatic revision.',
    teachingApproach: 'High-yield conceptual notes, 3D anatomical walkthroughs, and weekly diagnostic MCQs.',
    featured: true,
    verified: true,
    status: 'verified',
    availability: ['Monday 3:00 PM - 6:00 PM', 'Friday 4:00 PM - 7:00 PM', 'Saturday 2:00 PM - 6:00 PM'],
    badges: ['MDCAT Gold Mentor', 'Verified Doctor', 'Top Rated Tutor 2026']
  },
  {
    id: 'tutor-bilal',
    name: 'Bilal Khan',
    gender: 'Male',
    avatar: tutorAhmedImg,
    title: 'Physics & Engineering Mechanics Instructor',
    qualification: 'M.S. in Mechanical Engineering',
    university: 'NUST / GIKI Fellow',
    experienceYears: 7,
    rating: 4.9,
    reviewCount: 34,
    hourlyRate: 26,
    salaryAmount: 1900,
    salaryFrequency: 'monthly',
    studentTuitionFee: 2300,
    currency: '$',
    subjects: ['Physics', 'Mathematics'],
    classes: ['Matric / O-Levels (Grade 9 - 10)', 'FSc / A-Levels (Grade 11 - 12)', 'Entry Test (MDCAT / ECAT / SAT)'],
    cities: ['Karachi', 'Online Only'],
    teachingArea: 'Clifton, DHA Phase 5 & 6',
    mode: ['In-Person', 'Online', 'Hybrid'],
    bio: 'Passionate about demystifying kinematics, rotational dynamics, circuits, and quantum physics for high school and pre-engineering aspirants.',
    teachingApproach: 'Simulation demonstrations, everyday physical analogies, and formula derivation frameworks.',
    featured: true,
    verified: true,
    status: 'verified',
    availability: ['Wednesday 4:00 PM - 8:00 PM', 'Friday 3:00 PM - 7:00 PM', 'Sunday 10:00 AM - 1:00 PM'],
    badges: ['ECAT Physics Leader', 'Background Verified']
  },
  {
    id: 'tutor-zainab',
    name: 'Zainab Tariq',
    gender: 'Female',
    avatar: tutorSarahImg,
    title: 'Primary & Middle School Foundation Mentor',
    qualification: 'B.Ed & M.A. in Child Psychology & Education',
    university: 'Punjab University Institute of Education',
    experienceYears: 9,
    rating: 5.0,
    reviewCount: 51,
    hourlyRate: 20,
    salaryAmount: 1500,
    salaryFrequency: 'monthly',
    studentTuitionFee: 1800,
    currency: '$',
    subjects: ['Mathematics', 'English & Literature', 'Languages & Linguistics'],
    classes: ['Primary (Grade 1 - 5)', 'Middle School (Grade 6 - 8)'],
    cities: ['Lahore', 'Multan', 'Online Only'],
    teachingArea: 'Cantt, Askari 10 & Cavalry Ground',
    mode: ['In-Person', 'Online'],
    bio: 'Patient, nurturing educator specializing in foundational numeracy, early literacy, phonics, and homework assistance for young learners in grades 1 through 8.',
    teachingApproach: 'Montessori-inspired hands-on math tools, gamified reading challenges, and positive reinforcement.',
    featured: false,
    verified: true,
    status: 'verified',
    availability: ['Monday - Thursday 3:00 PM - 6:00 PM', 'Saturday 9:00 AM - 12:00 PM'],
    badges: ['Early Learning Specialist', 'Child Safety Certified']
  },
  {
    id: 'tutor-hamza',
    name: 'Hamza Sheikh',
    gender: 'Male',
    avatar: tutorAhmedImg,
    title: 'Computer Science, Python & AI Foundations',
    qualification: 'B.S. in Computer Science',
    university: 'FAST-NUCES',
    experienceYears: 5,
    rating: 4.8,
    reviewCount: 29,
    hourlyRate: 30,
    salaryAmount: 2200,
    salaryFrequency: 'monthly',
    studentTuitionFee: 2700,
    currency: '$',
    subjects: ['Computer Science & Coding', 'Mathematics'],
    classes: ['Middle School (Grade 6 - 8)', 'Matric / O-Levels (Grade 9 - 10)', 'FSc / A-Levels (Grade 11 - 12)', 'University Undergraduate'],
    cities: ['Karachi', 'Islamabad', 'Online Only'],
    teachingArea: 'Gulshan-e-Iqbal & PECHS',
    mode: ['Online', 'Hybrid'],
    bio: 'Software engineer and coding mentor teaching Python, algorithms, Scratch for kids, and Cambridge O/A-Level Computer Science (0478 & 9618).',
    teachingApproach: 'Live interactive coding, practical mini-projects, and algorithmic puzzle breakdowns.',
    featured: false,
    verified: true,
    status: 'verified',
    availability: ['Tuesday 6:00 PM - 9:00 PM', 'Thursday 6:00 PM - 9:00 PM', 'Saturday 3:00 PM - 7:00 PM'],
    badges: ['CAIE CS Specialist', 'Python Certified']
  },
  {
    id: 'tutor-mariam',
    name: 'Mariam Siddiqui',
    gender: 'Female',
    avatar: tutorFatimaImg,
    title: 'Chemistry & Organic Synthesis Coach',
    qualification: 'M.Sc. in Analytical Chemistry',
    university: 'Quaid-i-Azam University',
    experienceYears: 7,
    rating: 4.9,
    reviewCount: 41,
    hourlyRate: 24,
    salaryAmount: 1700,
    salaryFrequency: 'monthly',
    studentTuitionFee: 2100,
    currency: '$',
    subjects: ['Chemistry', 'Biology & Life Sciences'],
    classes: ['Matric / O-Levels (Grade 9 - 10)', 'FSc / A-Levels (Grade 11 - 12)'],
    cities: ['Peshawar', 'Rawalpindi', 'Online Only'],
    teachingArea: 'Hayatabad Phase 3 & University Town',
    mode: ['In-Person', 'Online', 'Hybrid'],
    bio: 'Known for simplifying chemical reaction mechanisms, stoichiometry, and periodic table trends with structured memory maps and past paper drills.',
    teachingApproach: 'Mechanism mapping, step-by-step mole calculation formulas, and weekly mock quizzes.',
    featured: false,
    verified: true,
    status: 'verified',
    availability: ['Monday 4:00 PM - 7:00 PM', 'Wednesday 4:00 PM - 7:00 PM', 'Saturday 1:00 PM - 5:00 PM'],
    badges: ['Top Science Tutor', 'Verified Educator']
  },
  {
    id: 'tutor-usman',
    name: 'Usman Ali',
    gender: 'Male',
    avatar: tutorAhmedImg,
    title: 'Economics, Accounting & Business Studies',
    qualification: 'ACCA Member & B.Sc. in Applied Accounting (Oxford Brookes)',
    university: 'Oxford Brookes University / ACCA',
    experienceYears: 8,
    rating: 4.9,
    reviewCount: 37,
    hourlyRate: 27,
    salaryAmount: 2000,
    salaryFrequency: 'monthly',
    studentTuitionFee: 2500,
    currency: '$',
    subjects: ['Economics & Commerce', 'Mathematics'],
    classes: ['Matric / O-Levels (Grade 9 - 10)', 'FSc / A-Levels (Grade 11 - 12)', 'University Undergraduate'],
    cities: ['Lahore', 'Faisalabad', 'Online Only'],
    teachingArea: 'Wapda Town, Johar Town & Bahria',
    mode: ['In-Person', 'Online', 'Hybrid'],
    bio: 'Corporate accountant turned passionate teacher for IGCSE/O-Level & A-Level Economics, Business Studies, and Accounting. Focus on real-world case studies.',
    teachingApproach: 'Ledger drills, macro diagrams, financial modeling examples, and CAIE evaluation rubrics.',
    featured: false,
    verified: true,
    status: 'verified',
    availability: ['Tuesday 4:00 PM - 8:00 PM', 'Friday 4:00 PM - 8:00 PM', 'Sunday 2:00 PM - 6:00 PM'],
    badges: ['Finance Mentor', 'ACCA Qualified']
  }
];

// Designed to accommodate 10 promotional posters as specified
export const PROMOTIONAL_POSTERS: Poster[] = [
  {
    id: 'poster-1',
    title: 'Become a Home Tutor: Share Knowledge, Earn Well',
    category: 'Recruitment',
    imageUrl: posterTutorHiringImg,
    description: 'Join our certified network of home tutors. Flexible hours, verified student matches, and competitive hourly compensation across all major cities.',
    badgeText: 'Tutor Hiring 2026'
  },
  {
    id: 'poster-2',
    title: 'O & A-Level Exam Prep Intensive Crash Course',
    category: 'Exam Prep',
    imageUrl: posterAcademicImg,
    description: 'Past-paper drills, examiner rubric insights, and targeted 1-on-1 tutoring for Cambridge CAIE and Edexcel board exams.',
    badgeText: 'CAIE High Achievers'
  },
  {
    id: 'poster-3',
    title: 'Mastering High School STEM: Math & Physics Made Easy',
    category: 'STEM',
    imageUrl: posterStemMathImg,
    description: 'Transform anxiety into mastery. Our verified STEM tutors clarify core principles with visual step-by-step guidance right at your home.',
    badgeText: 'STEM Foundation'
  },
  {
    id: 'poster-4',
    title: 'Primary Foundations: Confident Young Readers & Thinkers',
    category: 'Primary',
    imageUrl: posterPrimaryReadingImg,
    description: 'Grade 1-5 personalized home tutoring focusing on early literacy, mental arithmetic, and cultivating positive study habits.',
    badgeText: 'Early Grades'
  },
  {
    id: 'poster-5',
    title: 'MDCAT & Medical Entry Test 90-Day Sprint',
    category: 'Exam Prep',
    imageUrl: posterMedicalMdcatImg,
    description: 'Intensive biology and chemistry coaching by medical doctors and high-ranking alumni with daily diagnostic quizzes.',
    badgeText: 'Pre-Medical Prep'
  },
  {
    id: 'poster-6',
    title: 'Coding & Robotics for Young Innovators',
    category: 'STEM',
    imageUrl: posterCodingRoboticsImg,
    description: 'Python programming, game development, and logic building for kids and teens taught by experienced tech mentors.',
    badgeText: 'Future Skills'
  },
  {
    id: 'poster-7',
    title: 'Fluent English & Public Speaking Academy',
    category: 'Language',
    imageUrl: posterEnglishIeltsImg,
    description: 'Accent refinement, grammar mastery, vocabulary expansion, and IELTS/TOEFL 8.0+ band preparation.',
    badgeText: 'Language & Comms'
  },
  {
    id: 'poster-8',
    title: 'Chemistry & Biology Laboratory Concept Series',
    category: 'STEM',
    imageUrl: posterChemistryLabImg,
    description: 'Clear the organic chemistry and cellular biology hurdles with personalized diagrams, 3D animations, and study guides.',
    badgeText: 'Science Mastery'
  },
  {
    id: 'poster-9',
    title: 'ECAT & Pre-Engineering College Entrance Program',
    category: 'Exam Prep',
    imageUrl: posterEngineeringEcatImg,
    description: 'Proven strategies for NUST, GIKI, FAST, and UET entrance examinations with specialized short-cut techniques.',
    badgeText: 'Engineering Test'
  },
  {
    id: 'poster-10',
    title: 'Urdu & Islamic Studies Academic Support',
    category: 'Language',
    imageUrl: posterUrduHumanitiesImg,
    description: 'Comprehensive curriculum assistance for Matric, FSc, and O-Level compulsory subjects with structured essays and poetry commentary.',
    badgeText: 'Core Humanities'
  }
];

export const HOME_TUTOR_VIDEOS: VideoContent[] = [
  {
    id: 'video-1',
    title: 'How Home Tutor Matches Students with the Perfect Mentor',
    description: 'Comprehensive walkthrough of our verified 1-on-1 home tutoring methodology, subject diagnostics, and personalized student learning plans.',
    tutorName: 'Home Tutor Academic Board',
    tutorRole: 'Senior Academic Director',
    duration: '05:15',
    thumbnailUrl: tutorSarahImg,
    videoUrl: 'https://www.youtube.com/embed/kITJ6qH7jS0',
    views: '18.4k views',
    tags: ['Orientation', 'Home Tuition', 'Verified Mentors']
  },
  {
    id: 'video-2',
    title: 'Mastering Math & Physics: 1-on-1 Conceptual Problem Solving',
    description: 'Dr. Ahmed Raza demonstrates how interactive step-by-step problem mapping and past paper drills transform student confidence in Matric & O-Levels algebra.',
    tutorName: 'Dr. Ahmed Raza',
    tutorRole: 'PhD, Applied Mathematics & Physics',
    duration: '07:40',
    thumbnailUrl: tutorAhmedImg,
    videoUrl: 'https://www.youtube.com/embed/aircAruvnKk',
    views: '14.1k views',
    tags: ['Mathematics', 'Physics', 'O-Levels']
  },
  {
    id: 'video-3',
    title: 'Biology & Medical Sciences: Active Recall Study Strategies',
    description: 'Fatima Zahra guides pre-medical students on high-yield revision techniques, cellular diagram memory aids, and MDCAT question analysis.',
    tutorName: 'Fatima Zahra',
    tutorRole: 'M.Phil Biochemistry, Pre-Med Mentor',
    duration: '06:25',
    thumbnailUrl: tutorFatimaImg,
    videoUrl: 'https://www.youtube.com/embed/p60rN9JEapg',
    views: '12.9k views',
    tags: ['Pre-Medical', 'MDCAT', 'Biology']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    studentName: 'Zayd M.',
    parentName: 'Mrs. S. Mansoor',
    role: 'Parent of Grade 10 Student',
    grade: 'O-Levels (CAIE)',
    subject: 'Physics & Chemistry',
    comment: 'Finding a verified tutor who could come to our home in Gulberg was a lifesaver. Dr. Ahmed clarified complex physics concepts within 3 weeks. Zayd went from a B- grade to an A* in his final mock exams.',
    rating: 5,
    tutorName: 'Dr. Ahmed Raza',
    location: 'Lahore, Pakistan'
  },
  {
    id: 'test-2',
    studentName: 'Aleeza Tariq',
    role: 'A-Level Pre-Medical Student',
    grade: 'A-Levels (Grade 12)',
    subject: 'Biology & Chemistry',
    comment: 'Miss Fatima is exceptional! Her mnemonics and diagram walkthroughs made organic chemistry so straightforward. She also guided me on how to prepare for MDCAT simultaneously.',
    rating: 5,
    tutorName: 'Fatima Zahra',
    location: 'Islamabad, Pakistan'
  },
  {
    id: 'test-3',
    studentName: 'Hamdan K.',
    parentName: 'Col. (R) Khalid Khan',
    role: 'Parent of Grade 7 Student',
    grade: 'Middle School (Grade 7)',
    subject: 'Mathematics & English',
    comment: 'The booking process was effortless. Miss Zainab is extraordinarily patient with young kids. Hamdan now looks forward to his study sessions and his teacher remarked on his marked improvement.',
    rating: 5,
    tutorName: 'Zainab Tariq',
    location: 'Rawalpindi, Pakistan'
  }
];

export const STATS_DATA = [
  { label: 'Active Verified Tutors', value: '450+' },
  { label: 'Successful Appointments', value: '12,500+' },
  { label: 'Student Satisfaction Rate', value: '98.6%' },
  { label: 'Major Cities Covered', value: '8 Cities' }
];

export const SOCIAL_LINKS = [
  { name: 'TikTok', handle: '@hometutor.pk', url: 'https://tiktok.com', followers: '45k followers' },
  { name: 'Facebook', handle: 'HomeTutorOfficial', url: 'https://facebook.com', followers: '82k followers' },
  { name: 'YouTube', handle: 'Home Tutor Academy', url: 'https://youtube.com', followers: '28k subscribers' },
  { name: 'Instagram', handle: '@hometutor.academy', url: 'https://instagram.com', followers: '53k followers' }
];

// Helper to get formatted dates relative to today
const getRelativeDateStr = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    fullName: 'Zayd Al-Mansoor',
    gradeLevel: 'Matric / O-Levels (Grade 10)',
    subjects: ['Mathematics', 'Physics'],
    assignedTutorId: 'tutor-ahmed',
    assignedTutorName: 'Dr. Ahmed Raza',
    parentName: 'Tariq Al-Mansoor',
    parentPhone: '+92 300 8472910',
    parentEmail: 'tariq.mansoor@example.com',
    city: 'Islamabad',
    address: 'House 42, Street 18, Sector F-8/2',
    teachingMode: 'Home Tuition',
    enrollmentDate: '2026-08-15',
    status: 'active',
    monthlyFee: 3000,
    notes: 'Aiming for A* in Cambridge CAIE Mathematics 4024. Needs regular past paper drills.',
    nextClass: {
      studentName: 'Zayd Al-Mansoor',
      tutorName: 'Dr. Ahmed Raza',
      classGrade: 'Matric / O-Levels (Grade 10)',
      subject: 'Mathematics',
      nextClassDate: getRelativeDateStr(0), // Today
      startTime: '17:00',
      endTime: '18:30',
      teachingMode: 'Home Tuition',
      isToday: true
    }
  },
  {
    id: 'std-2',
    fullName: 'Aleeza Tariq',
    gradeLevel: 'FSc / A-Levels (Grade 12)',
    subjects: ['Biology & Life Sciences', 'Chemistry'],
    assignedTutorId: 'tutor-fatima',
    assignedTutorName: 'Fatima Zahra',
    parentName: 'Dr. Tariq Jamil',
    parentPhone: '+92 321 4455889',
    parentEmail: 'dr.tariq@example.com',
    city: 'Lahore',
    address: '14-A, Model Town C Block',
    teachingMode: 'Home Tuition',
    enrollmentDate: '2026-09-01',
    status: 'active',
    monthlyFee: 2500,
    notes: 'MDCAT preparation along with CAIE A2 Biology revision.',
    nextClass: {
      studentName: 'Aleeza Tariq',
      tutorName: 'Fatima Zahra',
      classGrade: 'FSc / A-Levels (Grade 12)',
      subject: 'Biology & Life Sciences',
      nextClassDate: getRelativeDateStr(0), // Today
      startTime: '16:00',
      endTime: '17:30',
      teachingMode: 'Home Tuition',
      isToday: true
    }
  },
  {
    id: 'std-3',
    fullName: 'Hamdan Khan',
    gradeLevel: 'Middle School (Grade 7)',
    subjects: ['Mathematics', 'English & Literature'],
    assignedTutorId: 'tutor-zainab',
    assignedTutorName: 'Zainab Tariq',
    parentName: 'Col. (R) Khalid Khan',
    parentPhone: '+92 333 5192837',
    parentEmail: 'khalid.khan@example.com',
    city: 'Lahore',
    address: 'Bungalow 78, Askari 10',
    teachingMode: 'Home Tuition',
    enrollmentDate: '2026-07-20',
    status: 'active',
    monthlyFee: 1800,
    notes: 'Focus on building strong mental math and grammar foundation.',
    nextClass: {
      studentName: 'Hamdan Khan',
      tutorName: 'Zainab Tariq',
      classGrade: 'Middle School (Grade 7)',
      subject: 'Mathematics',
      nextClassDate: getRelativeDateStr(1), // Tomorrow
      startTime: '15:30',
      endTime: '17:00',
      teachingMode: 'Home Tuition'
    }
  },
  {
    id: 'std-4',
    fullName: 'Daniyal Ahmed',
    gradeLevel: 'Matric / O-Levels (Grade 9)',
    subjects: ['Computer Science & Coding'],
    assignedTutorId: 'tutor-hamza',
    assignedTutorName: 'Hamza Sheikh',
    parentName: 'Ahmed Bilal',
    parentPhone: '+92 301 9876543',
    parentEmail: 'ahmed.b@example.com',
    city: 'Karachi',
    address: 'Flat 302, Phase 6 DHA',
    teachingMode: 'Online',
    enrollmentDate: '2026-09-10',
    status: 'active',
    monthlyFee: 2700,
    notes: 'Learning Python programming and O-Level CS theory syllabus 0478.',
    nextClass: {
      studentName: 'Daniyal Ahmed',
      tutorName: 'Hamza Sheikh',
      classGrade: 'Matric / O-Levels (Grade 9)',
      subject: 'Computer Science & Coding',
      nextClassDate: getRelativeDateStr(1), // Tomorrow
      startTime: '18:00',
      endTime: '19:30',
      teachingMode: 'Online'
    }
  },
  {
    id: 'std-5',
    fullName: 'Sara Rehman',
    gradeLevel: 'FSc / A-Levels (Grade 11)',
    subjects: ['English & Literature'],
    assignedTutorId: 'tutor-sarah',
    assignedTutorName: 'Sarah Jenkins',
    parentName: 'Mrs. Rehman',
    parentPhone: '+92 302 1234567',
    parentEmail: 'rehman.family@example.com',
    city: 'Lahore',
    address: 'House 19, Street 4, DHA Phase 5',
    teachingMode: 'Hybrid',
    enrollmentDate: '2026-08-01',
    status: 'active',
    monthlyFee: 2200,
    notes: 'Creative writing and essay critique for CAIE English Language (9093).',
    nextClass: {
      studentName: 'Sara Rehman',
      tutorName: 'Sarah Jenkins',
      classGrade: 'FSc / A-Levels (Grade 11)',
      subject: 'English & Literature',
      nextClassDate: getRelativeDateStr(2),
      startTime: '16:30',
      endTime: '18:00',
      teachingMode: 'Hybrid'
    }
  },
  {
    id: 'std-6',
    fullName: 'Bilal Mustafa',
    gradeLevel: 'Entry Test (MDCAT / ECAT / SAT)',
    subjects: ['Physics', 'Mathematics'],
    assignedTutorId: 'tutor-bilal',
    assignedTutorName: 'Bilal Khan',
    parentName: 'Mustafa Kamal',
    parentPhone: '+92 334 7654321',
    parentEmail: 'mustafa.k@example.com',
    city: 'Karachi',
    address: 'House 55, Khayaban-e-Shamsheer, DHA Phase 5',
    teachingMode: 'Home Tuition',
    enrollmentDate: '2026-09-15',
    status: 'active',
    monthlyFee: 2300,
    notes: 'ECAT intensive crash course covering mechanics and electricity.',
    nextClass: {
      studentName: 'Bilal Mustafa',
      tutorName: 'Bilal Khan',
      classGrade: 'Entry Test (MDCAT / ECAT / SAT)',
      subject: 'Physics',
      nextClassDate: getRelativeDateStr(2),
      startTime: '17:00',
      endTime: '18:30',
      teachingMode: 'Home Tuition'
    }
  }
];

export const INITIAL_CLASS_SESSIONS: ClassSession[] = [
  {
    id: 'sess-1',
    studentId: 'std-1',
    studentName: 'Zayd Al-Mansoor',
    tutorId: 'tutor-ahmed',
    tutorName: 'Dr. Ahmed Raza',
    subject: 'Mathematics',
    classGrade: 'Matric / O-Levels (Grade 10)',
    sessionDate: getRelativeDateStr(0), // Today
    startTime: '17:00',
    endTime: '18:30',
    teachingMode: 'Home Tuition',
    status: 'scheduled',
    meetingLinkOrAddress: 'House 42, Street 18, Sector F-8/2, Islamabad',
    internalNotes: 'Calculus derivatives and trigonometric identities mock test.'
  },
  {
    id: 'sess-2',
    studentId: 'std-2',
    studentName: 'Aleeza Tariq',
    tutorId: 'tutor-fatima',
    tutorName: 'Fatima Zahra',
    subject: 'Biology & Life Sciences',
    classGrade: 'FSc / A-Levels (Grade 12)',
    sessionDate: getRelativeDateStr(0), // Today
    startTime: '16:00',
    endTime: '17:30',
    teachingMode: 'Home Tuition',
    status: 'scheduled',
    meetingLinkOrAddress: '14-A, Model Town C Block, Lahore',
    internalNotes: 'Human circulatory system diagrams and MDCAT MCQ practice.'
  },
  {
    id: 'sess-3',
    studentId: 'std-3',
    studentName: 'Hamdan Khan',
    tutorId: 'tutor-zainab',
    tutorName: 'Zainab Tariq',
    subject: 'Mathematics',
    classGrade: 'Middle School (Grade 7)',
    sessionDate: getRelativeDateStr(1), // Tomorrow
    startTime: '15:30',
    endTime: '17:00',
    teachingMode: 'Home Tuition',
    status: 'scheduled',
    meetingLinkOrAddress: 'Bungalow 78, Askari 10, Lahore',
    internalNotes: 'Fractions and decimals hands-on exercises.'
  },
  {
    id: 'sess-4',
    studentId: 'std-4',
    studentName: 'Daniyal Ahmed',
    tutorId: 'tutor-hamza',
    tutorName: 'Hamza Sheikh',
    subject: 'Computer Science & Coding',
    classGrade: 'Matric / O-Levels (Grade 9)',
    sessionDate: getRelativeDateStr(1), // Tomorrow
    startTime: '18:00',
    endTime: '19:30',
    teachingMode: 'Online',
    status: 'scheduled',
    meetingLinkOrAddress: 'https://meet.google.com/hmt-pyth-dny',
    internalNotes: 'Python loops and function scope exercises.'
  },
  {
    id: 'sess-5',
    studentId: 'std-5',
    studentName: 'Sara Rehman',
    tutorId: 'tutor-sarah',
    tutorName: 'Sarah Jenkins',
    subject: 'English & Literature',
    classGrade: 'FSc / A-Levels (Grade 11)',
    sessionDate: getRelativeDateStr(2),
    startTime: '16:30',
    endTime: '18:00',
    teachingMode: 'Hybrid',
    status: 'scheduled',
    meetingLinkOrAddress: 'House 19, Street 4, DHA Phase 5, Lahore',
    internalNotes: 'Critical commentary review on 20th century poetry.'
  },
  {
    id: 'sess-6',
    studentId: 'std-6',
    studentName: 'Bilal Mustafa',
    tutorId: 'tutor-bilal',
    tutorName: 'Bilal Khan',
    subject: 'Physics',
    classGrade: 'Entry Test (MDCAT / ECAT / SAT)',
    sessionDate: getRelativeDateStr(2),
    startTime: '17:00',
    endTime: '18:30',
    teachingMode: 'Home Tuition',
    status: 'scheduled',
    meetingLinkOrAddress: 'Khayaban-e-Shamsheer, DHA Phase 5, Karachi',
    internalNotes: 'Kinematics formulas and projectile motion simulations.'
  },
  {
    id: 'sess-7',
    studentId: 'std-1',
    studentName: 'Zayd Al-Mansoor',
    tutorId: 'tutor-ahmed',
    tutorName: 'Dr. Ahmed Raza',
    subject: 'Mathematics',
    classGrade: 'Matric / O-Levels (Grade 10)',
    sessionDate: getRelativeDateStr(-2), // 2 days ago
    startTime: '17:00',
    endTime: '18:30',
    teachingMode: 'Home Tuition',
    status: 'completed',
    meetingLinkOrAddress: 'House 42, Street 18, Sector F-8/2, Islamabad',
    internalNotes: 'Quadratic equations review session. Student scored 92% on quiz.'
  }
];

export const INITIAL_TUTOR_SALARIES: TutorSalaryRecord[] = [
  {
    id: 'sal-1',
    tutorId: 'tutor-ahmed',
    tutorName: 'Dr. Ahmed Raza',
    billingPeriod: 'September 2026',
    amount: 2400,
    paymentFrequency: 'monthly',
    classesCount: 16,
    dueDate: '2026-10-05',
    paidDate: '2026-10-04',
    status: 'paid',
    paymentMethod: 'Bank Transfer (Meezan Bank)',
    notes: 'Full monthly compensation for 16 completed sessions.'
  },
  {
    id: 'sal-2',
    tutorId: 'tutor-ahmed',
    tutorName: 'Dr. Ahmed Raza',
    billingPeriod: 'October 2026',
    amount: 2400,
    paymentFrequency: 'monthly',
    classesCount: 12,
    dueDate: '2026-11-05',
    status: 'pending',
    notes: 'Current billing cycle compensation in progress.'
  },
  {
    id: 'sal-3',
    tutorId: 'tutor-sarah',
    tutorName: 'Sarah Jenkins',
    billingPeriod: 'September 2026',
    amount: 1800,
    paymentFrequency: 'monthly',
    classesCount: 14,
    dueDate: '2026-10-05',
    paidDate: '2026-10-05',
    status: 'paid',
    paymentMethod: 'Direct Deposit',
    notes: 'September compensation disbursed.'
  },
  {
    id: 'sal-4',
    tutorId: 'tutor-sarah',
    tutorName: 'Sarah Jenkins',
    billingPeriod: 'October 2026',
    amount: 1800,
    paymentFrequency: 'monthly',
    classesCount: 10,
    dueDate: '2026-11-05',
    status: 'pending',
    notes: 'October billing cycle active.'
  },
  {
    id: 'sal-5',
    tutorId: 'tutor-fatima',
    tutorName: 'Fatima Zahra',
    billingPeriod: 'September 2026',
    amount: 2000,
    paymentFrequency: 'monthly',
    classesCount: 15,
    dueDate: '2026-10-05',
    paidDate: '2026-10-03',
    status: 'paid',
    paymentMethod: 'Bank Transfer',
    notes: 'Monthly pre-med tutoring fee paid in full.'
  },
  {
    id: 'sal-6',
    tutorId: 'tutor-bilal',
    tutorName: 'Bilal Khan',
    billingPeriod: 'October 2026',
    amount: 1900,
    paymentFrequency: 'monthly',
    classesCount: 11,
    dueDate: '2026-11-05',
    status: 'pending',
    notes: 'October compensation pending month-end close.'
  }
];

export const INITIAL_STUDENT_FEES: StudentFeeRecord[] = [
  {
    id: 'fee-1',
    studentId: 'std-1',
    studentName: 'Zayd Al-Mansoor',
    billingPeriod: 'September 2026',
    amount: 3000,
    amountPaid: 3000,
    dueDate: '2026-09-10',
    paidDate: '2026-09-08',
    status: 'paid',
    paymentMethod: 'Online Bank Transfer',
    notes: 'September tuition fee cleared.'
  },
  {
    id: 'fee-2',
    studentId: 'std-1',
    studentName: 'Zayd Al-Mansoor',
    billingPeriod: 'October 2026',
    amount: 3000,
    amountPaid: 0,
    dueDate: '2026-10-20',
    status: 'pending',
    notes: 'October monthly tuition fee invoice issued.'
  },
  {
    id: 'fee-3',
    studentId: 'std-2',
    studentName: 'Aleeza Tariq',
    billingPeriod: 'October 2026',
    amount: 2500,
    amountPaid: 2500,
    dueDate: '2026-10-10',
    paidDate: '2026-10-09',
    status: 'paid',
    paymentMethod: 'Bank Transfer',
    notes: 'October tuition fee cleared on time.'
  },
  {
    id: 'fee-4',
    studentId: 'std-3',
    studentName: 'Hamdan Khan',
    billingPeriod: 'October 2026',
    amount: 1800,
    amountPaid: 1000,
    dueDate: '2026-10-15',
    paidDate: '2026-10-12',
    status: 'partial',
    paymentMethod: 'Cash Deposit',
    notes: 'Partial payment of 1,000 received. Balance 800 due by Oct 25.'
  },
  {
    id: 'fee-5',
    studentId: 'std-4',
    studentName: 'Daniyal Ahmed',
    billingPeriod: 'September 2026',
    amount: 2700,
    amountPaid: 0,
    dueDate: '2026-09-25',
    status: 'overdue',
    notes: 'September tuition payment reminder sent to parent.'
  },
  {
    id: 'fee-6',
    studentId: 'std-5',
    studentName: 'Sara Rehman',
    billingPeriod: 'October 2026',
    amount: 2200,
    amountPaid: 2200,
    dueDate: '2026-10-10',
    paidDate: '2026-10-07',
    status: 'paid',
    paymentMethod: 'Online Banking',
    notes: 'Full tuition received.'
  }
];

