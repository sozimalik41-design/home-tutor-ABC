import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// In-memory rate limiting map (IP -> timestamps array)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  
  // Filter out timestamps outside the window
  const activeTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  
  if (activeTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, activeTimestamps);
    return true;
  }
  
  activeTimestamps.push(now);
  rateLimitMap.set(ip, activeTimestamps);
  return false;
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const active = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (active.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, active);
    }
  }
}, 5 * 60 * 1000);

// Middleware
app.use(express.json({ limit: '1mb' }));

// Verified Tutor Knowledge Base
const TUTORS_KNOWLEDGE_BASE = [
  {
    id: 'tutor-sarah',
    name: 'Sarah Jenkins',
    title: 'Senior English & Humanities Specialist',
    qualification: 'M.Phil in English Literature & Applied Linguistics (Cambridge/Oxford Scholar)',
    experienceYears: 8,
    rating: 4.9,
    hourlyRate: 25,
    currency: '$',
    subjects: ['English & Literature', 'Creative Writing', 'IELTS / TOEFL', 'History'],
    classes: ['Middle School (Grade 6 - 8)', 'Matric / O-Levels (Grade 9 - 10)', 'FSc / A-Levels (Grade 11 - 12)'],
    cities: ['Lahore', 'Islamabad', 'Online Only'],
    mode: ['In-Person', 'Online', 'Hybrid'],
    availability: ['Monday 4:00 PM - 7:00 PM', 'Wednesday 4:00 PM - 7:00 PM', 'Saturday 10:00 AM - 2:00 PM']
  },
  {
    id: 'tutor-ahmed',
    name: 'Dr. Ahmed Raza',
    title: 'Advanced Mathematics & Calculus Coach',
    qualification: 'Ph.D. in Applied Mathematics & Mathematical Modeling (Imperial College London & LUMS)',
    experienceYears: 10,
    rating: 5.0,
    hourlyRate: 35,
    currency: '$',
    subjects: ['Mathematics', 'Physics', 'Computer Science & Coding'],
    classes: ['Matric / O-Levels (Grade 9 - 10)', 'FSc / A-Levels (Grade 11 - 12)', 'Entry Test (MDCAT / ECAT / SAT)', 'University Undergraduate'],
    cities: ['Islamabad', 'Rawalpindi', 'Online Only'],
    mode: ['In-Person', 'Online', 'Hybrid'],
    availability: ['Tuesday 5:00 PM - 8:00 PM', 'Thursday 5:00 PM - 8:00 PM', 'Sunday 11:00 AM - 3:00 PM']
  },
  {
    id: 'tutor-fatima',
    name: 'Fatima Zahra',
    title: 'Biology & Medical Entry Test Specialist',
    qualification: 'MBBS, Certified Pre-Med Educator (King Edward Medical University)',
    experienceYears: 6,
    rating: 4.8,
    hourlyRate: 28,
    currency: '$',
    subjects: ['Biology & Life Sciences', 'Chemistry'],
    classes: ['Matric / O-Levels (Grade 9 - 10)', 'FSc / A-Levels (Grade 11 - 12)', 'Entry Test (MDCAT / ECAT / SAT)'],
    cities: ['Lahore', 'Faisalabad', 'Online Only'],
    mode: ['In-Person', 'Online'],
    availability: ['Monday 3:00 PM - 6:00 PM', 'Friday 4:00 PM - 7:00 PM', 'Saturday 2:00 PM - 6:00 PM']
  },
  {
    id: 'tutor-bilal',
    name: 'Bilal Khan',
    title: 'Physics & Engineering Mechanics Instructor',
    qualification: 'M.S. in Mechanical Engineering (NUST / GIKI Fellow)',
    experienceYears: 7,
    rating: 4.9,
    hourlyRate: 26,
    currency: '$',
    subjects: ['Physics', 'Mathematics'],
    classes: ['Matric / O-Levels (Grade 9 - 10)', 'FSc / A-Levels (Grade 11 - 12)', 'Entry Test (MDCAT / ECAT / SAT)'],
    cities: ['Karachi', 'Online Only'],
    mode: ['In-Person', 'Online', 'Hybrid'],
    availability: ['Wednesday 4:00 PM - 8:00 PM', 'Friday 3:00 PM - 7:00 PM', 'Sunday 10:00 AM - 1:00 PM']
  },
  {
    id: 'tutor-zainab',
    name: 'Zainab Tariq',
    title: 'Primary & Middle School Foundation Mentor',
    qualification: 'B.Ed & M.A. in Child Psychology & Education (Punjab University)',
    experienceYears: 9,
    rating: 5.0,
    hourlyRate: 20,
    currency: '$',
    subjects: ['Mathematics', 'English & Literature', 'Languages & Linguistics'],
    classes: ['Primary (Grade 1 - 5)', 'Middle School (Grade 6 - 8)'],
    cities: ['Lahore', 'Multan', 'Online Only'],
    mode: ['In-Person', 'Online'],
    availability: ['Monday - Thursday 3:00 PM - 6:00 PM', 'Saturday 9:00 AM - 12:00 PM']
  },
  {
    id: 'tutor-hamza',
    name: 'Hamza Sheikh',
    title: 'Computer Science, Python & AI Foundations',
    qualification: 'B.S. in Computer Science (FAST-NUCES)',
    experienceYears: 5,
    rating: 4.8,
    hourlyRate: 30,
    currency: '$',
    subjects: ['Computer Science & Coding', 'Mathematics'],
    classes: ['Middle School (Grade 6 - 8)', 'Matric / O-Levels (Grade 9 - 10)', 'FSc / A-Levels (Grade 11 - 12)', 'University Undergraduate'],
    cities: ['Karachi', 'Islamabad', 'Online Only'],
    mode: ['Online', 'Hybrid'],
    availability: ['Tuesday 6:00 PM - 9:00 PM', 'Thursday 6:00 PM - 9:00 PM', 'Saturday 3:00 PM - 7:00 PM']
  },
  {
    id: 'tutor-mariam',
    name: 'Mariam Siddiqui',
    title: 'Chemistry & Organic Synthesis Coach',
    qualification: 'M.Sc. in Analytical Chemistry (Quaid-i-Azam University)',
    experienceYears: 7,
    rating: 4.9,
    hourlyRate: 24,
    currency: '$',
    subjects: ['Chemistry', 'Biology & Life Sciences'],
    classes: ['Matric / O-Levels (Grade 9 - 10)', 'FSc / A-Levels (Grade 11 - 12)'],
    cities: ['Peshawar', 'Rawalpindi', 'Online Only'],
    mode: ['In-Person', 'Online', 'Hybrid'],
    availability: ['Monday 4:00 PM - 7:00 PM', 'Wednesday 4:00 PM - 7:00 PM', 'Saturday 1:00 PM - 5:00 PM']
  },
  {
    id: 'tutor-usman',
    name: 'Usman Ali',
    title: 'Economics, Accounting & Business Studies',
    qualification: 'ACCA Member & B.Sc. in Applied Accounting (Oxford Brookes)',
    experienceYears: 8,
    rating: 4.8,
    hourlyRate: 28,
    currency: '$',
    subjects: ['Economics & Commerce', 'Mathematics'],
    classes: ['Matric / O-Levels (Grade 9 - 10)', 'FSc / A-Levels (Grade 11 - 12)', 'University Undergraduate'],
    cities: ['Lahore', 'Online Only'],
    mode: ['In-Person', 'Online', 'Hybrid'],
    availability: ['Tuesday 4:00 PM - 7:00 PM', 'Thursday 4:00 PM - 7:00 PM', 'Sunday 2:00 PM - 6:00 PM']
  }
];

const SYSTEM_INSTRUCTION = `You are "Home Tutor AI Assistant", the friendly, knowledgeable educational assistant for the Home Tutor platform (Pakistan's verified home and online tutoring service).

Core Identity & Guidelines:
1. Multilingual Fluency:
   - You MUST communicate fluently in English, Roman Urdu (Urdu written in Latin alphabet), and Urdu script.
   - Detect the language of the user's message:
     * If user writes in Roman Urdu (e.g. "Mujhe Maths ka tutor chahiye", "Fractions ko asaan alfaaz mein samjhao", "Appointment kaise book karun?"), reply in warm, clear, professional Roman Urdu.
     * If user writes in Urdu script (اردو), reply in Urdu.
     * If user writes in English, reply in English.
2. Educational Concept Teaching:
   - When asked academic questions (math, physics, chemistry, biology, English, coding), break concepts down step-by-step with clear real-world examples and friendly student-focused language.
   - For example, if asked about fractions in Roman Urdu ("Fractions ko asaan alfaaz mein samjhao"), explain using a pizza or cake analogy (numerator = kitne slices aapke paas hain, denominator = total kitne barabar hissay kiye gaye).
3. Verified Tutor Grounding & Real Data Integrity:
   - ONLY recommend and quote real verified tutors from the official Home Tutor database below.
   - NEVER invent fake tutors, non-existent rates, fake phone numbers, or pretend availability.
   - Available verified tutors:
     * Dr. Ahmed Raza (ID: tutor-ahmed): Advanced Mathematics, Calculus, Physics, Coding. Ph.D. Imperial & LUMS. $35/hr. Islamabad/Rawalpindi/Online. Availability: Tuesday 5-8 PM, Thursday 5-8 PM, Sunday 11 AM-3 PM.
     * Sarah Jenkins (ID: tutor-sarah): English & Literature, Creative Writing, IELTS/TOEFL. M.Phil Cambridge/Oxford Scholar. $25/hr. Lahore/Islamabad/Online. Availability: Monday 4-7 PM, Wednesday 4-7 PM, Saturday 10 AM-2 PM.
     * Fatima Zahra (ID: tutor-fatima): Biology, Chemistry, MDCAT Pre-Med. MBBS King Edward. $28/hr. Lahore/Faisalabad/Online. Availability: Monday 3-6 PM, Friday 4-7 PM, Saturday 2-6 PM.
     * Bilal Khan (ID: tutor-bilal): Physics, Engineering Mechanics, ECAT. M.S. NUST/GIKI. $26/hr. Karachi/Online. Availability: Wednesday 4-8 PM, Friday 3-7 PM, Sunday 10 AM-1 PM.
     * Zainab Tariq (ID: tutor-zainab): Primary (Grades 1-5) & Middle School, Foundational Math & English. B.Ed Punjab Univ. $20/hr. Lahore/Multan/Online. Availability: Mon-Thu 3-6 PM, Sat 9 AM-12 PM.
     * Hamza Sheikh (ID: tutor-hamza): Computer Science, Python, AI Foundations, O/A Level CS. FAST Alum. $30/hr. Karachi/Islamabad/Online. Availability: Tue 6-9 PM, Thu 6-9 PM, Sat 3-7 PM.
     * Mariam Siddiqui (ID: tutor-mariam): Chemistry, Organic Synthesis. M.Sc. QAU. $24/hr. Peshawar/Rawalpindi/Online. Availability: Mon 4-7 PM, Wed 4-7 PM, Sat 1-5 PM.
     * Usman Ali (ID: tutor-usman): Economics, Accounting, ACCA/Commerce. Oxford Brookes / ACCA. $28/hr. Lahore/Online. Availability: Tue 4-7 PM, Thu 4-7 PM, Sun 2-6 PM.
4. Booking & Platform Procedures:
   - Explain how to book an appointment clearly:
     1. Search or select a tutor by subject and city.
     2. Visit the Book Appointment page (/book-appointment).
     3. Select the preferred tutor, class level, subject, and teaching mode (In-Person or Online).
     4. Pick from the tutor's actual available time slots.
     5. Fill in student name and contact details, and submit for confirmation.
   - Do NOT claim that you (the chatbot) have confirmed or booked an appointment on the spot; always advise the student/parent to complete the booking via the official /book-appointment page.
5. Checking Class Schedule:
   - When asked "Meri class ka schedule kaise dekhoon?": Explain that students and parents receive confirmed schedules via SMS/WhatsApp and can view their trial and regular sessions under their Student Dashboard or via their booking confirmation email.
6. Safety, Privacy & Honesty:
   - Never reveal private student phone numbers, student home addresses, database keys, or server secrets.
   - If uncertain about a factual query outside verified platform data or educational curriculum, politely acknowledge uncertainty.
   - Keep replies structured, concise, and easy to read on mobile screens (use clean bullet points, bold key terms).`;

// Shared Gemini client instance
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Extract smart suggested actions based on context
function extractSuggestedActions(text: string, userMessage: string) {
  const actions: Array<{ label: string; href: string; tutorId?: string }> = [];
  const lowerText = (text + ' ' + userMessage).toLowerCase();

  if (lowerText.includes('ahmed') || lowerText.includes('math') || lowerText.includes('calculus')) {
    actions.push({
      label: 'Book Dr. Ahmed Raza',
      href: '/book-appointment?tutor=tutor-ahmed',
      tutorId: 'tutor-ahmed'
    });
  }
  if (lowerText.includes('sarah') || lowerText.includes('english') || lowerText.includes('ielts')) {
    actions.push({
      label: 'Book Sarah Jenkins',
      href: '/book-appointment?tutor=tutor-sarah',
      tutorId: 'tutor-sarah'
    });
  }
  if (lowerText.includes('fatima') || lowerText.includes('biology') || lowerText.includes('mdcat')) {
    actions.push({
      label: 'Book Fatima Zahra',
      href: '/book-appointment?tutor=tutor-fatima',
      tutorId: 'tutor-fatima'
    });
  }
  if (lowerText.includes('bilal') || lowerText.includes('physics') || lowerText.includes('ecat')) {
    actions.push({
      label: 'Book Bilal Khan',
      href: '/book-appointment?tutor=tutor-bilal',
      tutorId: 'tutor-bilal'
    });
  }

  // Always include primary navigation shortcuts if not present
  if (actions.length === 0 || lowerText.includes('appointment') || lowerText.includes('book') || lowerText.includes('schedule')) {
    actions.push({
      label: 'Book Appointment',
      href: '/book-appointment'
    });
  }

  actions.push({
    label: 'Browse All Tutors',
    href: '/tutors'
  });

  // Limit to max 3 relevant actions
  return actions.slice(0, 3);
}

// Fallback intelligent responder when GEMINI_API_KEY is not configured or offline
function generateLocalKnowledgeResponse(message: string): { reply: string; suggestedActions: Array<{ label: string; href: string }> } {
  const lower = message.toLowerCase().trim();

  // 1. Math query or Roman Urdu math request
  if (lower.includes('math') || lower.includes('hisab') || lower.includes('riazi')) {
    return {
      reply: `**Maths Tutors Available on Home Tutor:**\n\nHumare paas verified Mathematics specialists mojood hain:\n\n1. **Dr. Ahmed Raza** (Ph.D. Applied Math, Imperial College London & LUMS)\n   - **Subjects:** Mathematics, Calculus, Physics, Coding\n   - **Classes:** Matric, O/A-Levels, Entry Test (MDCAT/ECAT/SAT), University\n   - **Rate:** $35/hr • In-Person & Online\n   - **Slots:** Tuesday & Thursday (5:00 PM - 8:00 PM), Sunday (11:00 AM - 3:00 PM)\n\n2. **Bilal Khan** (M.S. Mechanical Engineering, NUST/GIKI Fellow)\n   - **Subjects:** Physics & Mathematics\n   - **Rate:** $26/hr • In-Person & Online\n\nAap directly niche diye gaye link se appointment book kar sakte hain!`,
      suggestedActions: [
        { label: 'Book with Dr. Ahmed Raza', href: '/book-appointment?tutor=tutor-ahmed' },
        { label: 'View All Math Tutors', href: '/tutors?subject=Mathematics' }
      ]
    };
  }

  // 2. Fractions explanation in Roman Urdu
  if (lower.includes('fraction') || lower.includes('kasar') || lower.includes('asaan alfaaz')) {
    return {
      reply: `### Fractions (کسر) ko Aasaan Alfaaz Mein Samjhein 🍕\n\nFraction ka matlab hai kisi **mukammal cheez ka ek hissa** (a part of a whole).\n\nEk aasaan misaal se samjhein:\nFarz karein aapke paas **1 Pizza** hai aur aapne uske **4 barabar tukray (slices)** kiye.\n\n- Agar aap **1 tukra** kha lete hain, to aapne pizza ka **1/4** hissa khaya.\n\n#### Fraction ke 2 hissay hotay hain:\n1. **Numerator (Ooper wala number):** Yeh batata hai ke aapke paas kitne tukray hain (Misaal: 1)\n2. **Denominator (Neeche wala number):** Yeh batata hai ke kul kitne barabar tukray kiye gaye thay (Misaal: 4)\n\n#### Ek aur Misaal:\n- **1/2:** Aadha (Half) — jaise 2 slices mein se 1 slice.\n- **3/4:** Teen chauthai (Three-quarters) — 4 slices mein se 3 slices.\n\nAapko specific question ya addition/subtraction mein help chahiye to zaroor batayein!`,
      suggestedActions: [
        { label: 'Book Math Tutor', href: '/book-appointment?tutor=tutor-ahmed' },
        { label: 'Find Tutors', href: '/tutors' }
      ]
    };
  }

  // 3. Appointment booking query in Roman Urdu or English
  if (lower.includes('appointment') || lower.includes('book') || lower.includes('kaise book')) {
    return {
      reply: `### Home Tutor Par Appointment Book Karne Ka Tareeqa 📅\n\nAppointment book karna nihayat aasaan hai:\n\n1. **Tutor Muntakhib Karein:** **Find Tutors** (/tutors) page par jayein aur subject, class level, aur city ke mutabiq qualified tutor chunein.\n2. **Book Appointment Form:** Tutor profile ya button par click kar ke **/book-appointment** page par jayein.\n3. **Details Darj Karein:** Student ka naam, class, subject aur session mode (Home Visit ya Online) muntakhib karein.\n4. **Time Slot Choose Karein:** Tutor ke official available timings mein se apni pasandeeda slot chunein.\n5. **Submit Karein:** Form submit karein. Hamari team aur tutor foran confirmation message bhejenge.\n\n*Note:* Chatbot directly koi booking bina aapki confirmation ke confirm nahi karta, baraye meherbani form zaroor pur karein.`,
      suggestedActions: [
        { label: 'Go to Book Appointment', href: '/book-appointment' },
        { label: 'Browse Verified Tutors', href: '/tutors' }
      ]
    };
  }

  // 4. Class schedule query in Roman Urdu or English
  if (lower.includes('schedule') || lower.includes('timing') || lower.includes('class ka')) {
    return {
      reply: `### Aapki Class Ka Schedule Kaise Dekhein? ⏰\n\nAap apni classes ka schedule darj zail tareeqon se dekh sakte hain:\n\n1. **Booking Confirmation Notification:** Jab aapka tutor session confirm hota hai, to aapko SMS aur WhatsApp par mukammal schedule aur link milta hai.\n2. **Tutor Direct Coordination:** Har appointment ke baad tutor aapke muntakhib waqt (e.g. Mon/Wed 4:00 PM) ke mutabiq available hota hai.\n3. **Tutor Profile Timings:** Har verified tutor ki profile par unke live weekly slots wazeh darj hain.\n\nAgar aap kisi specific tutor ka schedule dekhna chahte hain to mujhe unka naam batayein!`,
      suggestedActions: [
        { label: 'View Tutors & Timings', href: '/tutors' },
        { label: 'Contact Help Desk', href: '/contact' }
      ]
    };
  }

  // Default welcome response
  return {
    reply: `Assalam-o-Alaikum! Main **Home Tutor AI Assistant** hoon. \n\nMain aapki in cheezon mein madad kar sakta hoon:\n- **Verified Tutors dhoondna:** Maths, Physics, Chemistry, English, Coding, aur Primary education.\n- **Appointment Booking:** Trial class ya regular home visit schedule karne ka tareeqa.\n- **Academic Questions:** Kisi bhi subject ka mushkil topic (Maths, Science, Grammar) aasaan alfaaz mein samajhna.\n\nAap English, Roman Urdu, ya Urdu mein koi bhi sawaal pooch sakte hain!`,
    suggestedActions: [
      { label: 'Mujhe Maths ka tutor chahiye', href: '/book-appointment?tutor=tutor-ahmed' },
      { label: 'Browse All Tutors', href: '/tutors' }
    ]
  };
}

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    model: 'gemini-4-argon'
  });
});

app.get('/api/tutors/public', (_req: Request, res: Response) => {
  res.json(TUTORS_KNOWLEDGE_BASE);
});

// Chatbot endpoint with Thinking Mode and Gemini 4 Argon
app.post('/api/chat', async (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  // 1. Rate Limiting Check
  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment before sending another message.',
      reply: 'Aapne thori der mein bohot zyada messages bheje hain. Baraye meherbani chand lamhay intezar karein.'
    });
  }

  // 2. Input Validation
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be text.' });
  }

  const cleanMessage = message.trim();
  if (cleanMessage.length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  if (cleanMessage.length > 1500) {
    return res.status(400).json({ error: 'Message exceeds maximum allowed length of 1500 characters.' });
  }

  // Validate history array if provided
  let validatedHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  if (Array.isArray(history)) {
    validatedHistory = history
      .slice(-8) // Keep last 8 turns for context window
      .filter(item => 
        item && 
        (item.role === 'user' || item.role === 'assistant') && 
        typeof item.content === 'string' &&
        item.content.trim().length > 0 &&
        item.content.length <= 2000
      );
  }

  // 3. Check for Gemini Client
  const ai = getGeminiClient();

  if (!ai) {
    // Graceful fallback to verified platform intelligence
    const local = generateLocalKnowledgeResponse(cleanMessage);
    return res.json({
      reply: local.reply,
      suggestedActions: local.suggestedActions,
      modelUsed: 'local-knowledge-engine'
    });
  }

  try {
    // Format conversation history for Gemini SDK
    // Build contents array supporting multi-turn dialogue
    const contents: any[] = [];
    for (const h of validatedHistory) {
      contents.push({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      });
    }
    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: cleanMessage }]
    });

    // Execute with gemini-4-argon with ThinkingLevel.HIGH (do NOT set maxOutputTokens)
    let replyText = '';
    let thinkingSummary = '';
    let modelName = 'gemini-4-argon';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-argon',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH
          }
          // Note: maxOutputTokens is deliberately omitted per instructions
        }
      });

      replyText = response.text || '';
    } catch (argonError: any) {
      console.warn('Gemini 4 Argon attempt encountered an issue, falling back to gemini-3.8-flash:', argonError?.message || argonError);
      
      // Resilient fallback to gemini-3.8-flash
      modelName = 'gemini-3.8-flash';
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION
        }
      });
      replyText = fallbackResponse.text || '';
    }

    if (!replyText || replyText.trim().length === 0) {
      const local = generateLocalKnowledgeResponse(cleanMessage);
      replyText = local.reply;
    }

    const suggestedActions = extractSuggestedActions(replyText, cleanMessage);

    return res.json({
      reply: replyText,
      thinking: thinkingSummary || undefined,
      suggestedActions,
      modelUsed: modelName
    });

  } catch (err: any) {
    console.error('Server Gemini Error:', err?.message || err);
    // Return grounded local knowledge so the user is never left with a blank or broken screen
    const local = generateLocalKnowledgeResponse(cleanMessage);
    return res.json({
      reply: local.reply,
      suggestedActions: local.suggestedActions,
      modelUsed: 'fallback-knowledge-engine',
      note: 'Processed via Home Tutor local knowledge base.'
    });
  }
});

// Health check endpoint for Cloud Run
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Setup Dev or Production static serving
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const distIndexHtml = path.resolve(distPath, 'index.html');
  const hasDist = fs.existsSync(distIndexHtml);

  if (isProduction && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(distIndexHtml);
    });
    console.log(`📦 Serving production build from ${distPath}`);
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    // Fallback for direct browser navigation to SPA client routes
    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        const rootIndexHtml = path.resolve(__dirname, 'index.html');
        if (fs.existsSync(rootIndexHtml)) {
          let template = fs.readFileSync(rootIndexHtml, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else {
          next();
        }
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
    console.log('⚡ Vite middlewares mounted with SPA route handling');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Home Tutor Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
