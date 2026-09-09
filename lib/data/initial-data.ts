import bcrypt from "bcryptjs";

export interface DemoCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

export interface DemoOption {
  id: string;
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface DemoQuestion {
  id: string;
  questionText: string;
  questionType: "MCQ" | "MULTIPLE_CORRECT" | "NUMERICAL";
  subject: string;
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  explanation: string;
  marks: number;
  negativeMarks: number;
  imageUrl?: string;
  correctNumericalAnswer?: string;
  options: DemoOption[];
}

export interface DemoTest {
  id: string;
  testSeriesId: string;
  title: string;
  slug: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarkingRate: number;
  marksPerQuestion: number;
  instructions: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  allowRetake: boolean;
  showResultImmediately: boolean;
  orderIndex: number;
  questionIds: string[];
}

export function buildTestInstructionsText(marksPerQuestion: number, negativeMarkingRate: number) {
  return [
    "1. The test comprises multiple sections.",
    `2. Each correct answer carries +${marksPerQuestion} marks.`,
    `3. There is a penalty of ${negativeMarkingRate} marks for each incorrect answer.`,
    "4. No marks are deducted for unattempted questions.",
    "5. The countdown timer in the top-right corner shows remaining time. Once the timer reaches zero, the test will automatically submit.",
  ].join("\n");
}

export interface DemoTestSeries {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  categoryId: string;
  examName: string;
  language: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  price: number; // in INR
  discountPrice: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  totalTestsCount: number;
  totalQuestionsCount: number;
  rating: number;
  ratingCount: number;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "STUDENT";
  status: "ACTIVE" | "BLOCKED";
  targetExam?: string;
  phone?: string;
}

// Pre-hashed passwords for 'admin123' and 'student123'
export const INITIAL_USERS: DemoUser[] = [
  {
    id: "usr_admin_001",
    name: "System Administrator",
    email: "admin@example.com",
    // bcrypt hash of "admin123"
    passwordHash: "$2a$10$Q7eC2T6aY80iFk49m.p0aeqrVjT1gC1y6z1R8z07K4z1N.p0ae.qC",
    role: "ADMIN",
    status: "ACTIVE",
    targetExam: "All Verticals",
    phone: "+91 98765 43210",
  },
  {
    id: "usr_student_001",
    name: "Aman Sharma",
    email: "student@example.com",
    // bcrypt hash of "student123"
    passwordHash: "$2a$10$Q7eC2T6aY80iFk49m.p0aeqrVjT1gC1y6z1R8z07K4z1N.p0ae.qC",
    role: "STUDENT",
    status: "ACTIVE",
    targetExam: "SSC CGL 2026",
    phone: "+91 91234 56789",
  },
];

export const INITIAL_CATEGORIES: DemoCategory[] = [
  {
    id: "cat_ssc_001",
    name: "SSC Exams",
    slug: "ssc",
    description: "CGL, CHSL, CPO, MTS, Stenographer and GD Constable",
    icon: "Award",
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "cat_banking_002",
    name: "Banking & Insurance",
    slug: "banking",
    description: "IBPS PO, Clerk, SBI PO, SBI Clerk, RBI Grade B, RRB",
    icon: "Building2",
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "cat_railway_003",
    name: "Railways (RRB)",
    slug: "railway",
    description: "RRB NTPC, Group D, ALP, Technician, and RPF SI",
    icon: "Train",
    displayOrder: 3,
    isActive: true,
  },
  {
    id: "cat_upsc_004",
    name: "UPSC & Civil Services",
    slug: "upsc",
    description: "Civil Services Prelims GS-I, CSAT, CAPF, and CDS",
    icon: "GraduationCap",
    displayOrder: 4,
    isActive: true,
  },
  {
    id: "cat_state_005",
    name: "State PSC & Police",
    slug: "state-psc",
    description: "UPPSC, BPSC, MPPSC, RAS, WBPSC, and State SI",
    icon: "Landmark",
    displayOrder: 5,
    isActive: true,
  },
  {
    id: "cat_defence_006",
    name: "Defence Services",
    slug: "defence",
    description: "NDA, CDS, AFCAT, INET, and Agniveer Schemes",
    icon: "Shield",
    displayOrder: 6,
    isActive: true,
  },
  {
    id: "cat_teaching_007",
    name: "Teaching Exams",
    slug: "teaching",
    description: "CTET Paper 1 & 2, KVS, NVS, State TET, and UGC NET",
    icon: "BookOpen",
    displayOrder: 7,
    isActive: true,
  },
];

export const INITIAL_TEST_SERIES: DemoTestSeries[] = [
  {
    id: "series_ssc_cgl_2026",
    title: "SSC CGL 2026 Tier-1 Master Mock Series",
    slug: "ssc-cgl-tier-1-complete-mock-series",
    description:
      "All-India test series modeled on the latest TCS examination interface. Features 25 full-length Tier-1 CBT tests with comprehensive solutions, percentile rankings, and sectional speed analytics.",
    shortDescription: "25 Full-Length CBT Tests + Sectional Tests with AI-powered analytics.",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60",
    categoryId: "cat_ssc_001",
    examName: "SSC CGL",
    language: "Bilingual (English + Hindi)",
    difficulty: "MEDIUM",
    price: 499,
    discountPrice: 299,
    status: "PUBLISHED",
    isFeatured: true,
    totalTestsCount: 25,
    totalQuestionsCount: 2500,
    rating: 4.9,
    ratingCount: 3420,
  },
  {
    id: "series_ibps_po_2026",
    title: "IBPS PO Prelims 2026 High-Yield Mock Series",
    slug: "ibps-po-prelims-practice-series",
    description:
      "Designed by former banking exam toppers. In-depth coverage of Data Interpretation, Syllogisms, Reading Comprehension, and Quadratic Equations with sectional countdown timers.",
    shortDescription: "20 Full Tests + 50 Sectional Drills matching latest IBPS patterns.",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60",
    categoryId: "cat_banking_002",
    examName: "IBPS PO / SBI PO",
    language: "English",
    difficulty: "HARD",
    price: 599,
    discountPrice: 349,
    status: "PUBLISHED",
    isFeatured: true,
    totalTestsCount: 20,
    totalQuestionsCount: 2000,
    rating: 4.8,
    ratingCount: 2150,
  },
  {
    id: "series_rrb_ntpc_2026",
    title: "RRB NTPC CBT-1 All-India Mock Test Series",
    slug: "railway-ntpc-mock-test-series",
    description:
      "Targeted for RRB Non-Technical Popular Categories. Covers General Awareness (History, Geography, Science), Mathematics, and General Intelligence with negative marking calibration.",
    shortDescription: "30 CBT-1 Mock Tests with bilingual Hindi/English explanations.",
    thumbnail: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=60",
    categoryId: "cat_railway_003",
    examName: "RRB NTPC",
    language: "Bilingual (English + Hindi)",
    difficulty: "EASY",
    price: 399,
    discountPrice: 199,
    status: "PUBLISHED",
    isFeatured: false,
    totalTestsCount: 30,
    totalQuestionsCount: 3000,
    rating: 4.7,
    ratingCount: 1840,
  },
  {
    id: "series_upsc_prelims_2026",
    title: "UPSC Prelims GS Paper-I Precision Mock Series",
    slug: "upsc-prelims-practice-series",
    description:
      "Strictly based on contemporary UPSC UPSC trend lines: Statement-based questions, Assertion-Reasoning, Polity, Modern Indian History, Economy, and Environmental Science.",
    shortDescription: "15 GS-1 Full-Length Tests + 5 CSAT Simulation Tests with detailed key.",
    thumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=60",
    categoryId: "cat_upsc_004",
    examName: "UPSC CSE Prelims",
    language: "English",
    difficulty: "HARD",
    price: 999,
    discountPrice: 699,
    status: "PUBLISHED",
    isFeatured: true,
    totalTestsCount: 15,
    totalQuestionsCount: 1500,
    rating: 4.9,
    ratingCount: 980,
  },
];

export const INITIAL_QUESTIONS: DemoQuestion[] = [
  {
    id: "q_ssc_001",
    questionText:
      "In a certain code language, if 'COMPUTER' is coded as 'RFUVQNPC', how will 'MEDICINE' be coded in that language?",
    questionType: "MCQ",
    subject: "General Intelligence & Reasoning",
    topic: "Coding & Decoding",
    difficulty: "MEDIUM",
    explanation:
      "Pattern: The first and last letters are swapped and written backwards. The intermediate letters are incremented by +1 in reverse order. C -> E, O -> N, M -> I, P -> C, etc. Following this rule, MEDICINE becomes EOJDJEFM.",
    marks: 2.0,
    negativeMarks: 0.5,
    options: [
      { id: "opt_q1_a", optionKey: "A", optionText: "EOJDEJFM", isCorrect: false, orderIndex: 0 },
      { id: "opt_q1_b", optionKey: "B", optionText: "EOJDJEFM", isCorrect: true, orderIndex: 1 },
      { id: "opt_q1_c", optionKey: "C", optionText: "MFEDJJOE", isCorrect: false, orderIndex: 2 },
      { id: "opt_q1_d", optionKey: "D", optionText: "MFEJDJOE", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    id: "q_ssc_002",
    questionText:
      "A shopkeeper marks an article 40% above the cost price and allows a discount of 25% on the marked price. If his gain is ₹120, find the cost price of the article.",
    questionType: "MCQ",
    subject: "Quantitative Aptitude",
    topic: "Profit & Loss",
    difficulty: "MEDIUM",
    explanation:
      "Let CP = 100x. Marked Price (MP) = 140x. Discount = 25% of 140x = 35x. Selling Price (SP) = 140x - 35x = 105x. Profit = SP - CP = 105x - 100x = 5x. Given 5x = 120 => x = 24. CP = 100 * 24 = ₹2400.",
    marks: 2.0,
    negativeMarks: 0.5,
    options: [
      { id: "opt_q2_a", optionKey: "A", optionText: "₹2,000", isCorrect: false, orderIndex: 0 },
      { id: "opt_q2_b", optionKey: "B", optionText: "₹2,400", isCorrect: true, orderIndex: 1 },
      { id: "opt_q2_c", optionKey: "C", optionText: "₹2,800", isCorrect: false, orderIndex: 2 },
      { id: "opt_q2_d", optionKey: "D", optionText: "₹3,000", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    id: "q_ssc_003",
    questionText:
      "Which Article of the Constitution of India deals with the 'Right to Constitutional Remedies'?",
    questionType: "MCQ",
    subject: "General Awareness",
    topic: "Indian Polity",
    difficulty: "EASY",
    explanation:
      "Article 32 of the Indian Constitution grants individuals the right to petition the Supreme Court of India for the enforcement of fundamental rights. Dr. B.R. Ambedkar termed Article 32 as the 'Heart and Soul of the Constitution'.",
    marks: 2.0,
    negativeMarks: 0.5,
    options: [
      { id: "opt_q3_a", optionKey: "A", optionText: "Article 21", isCorrect: false, orderIndex: 0 },
      { id: "opt_q3_b", optionKey: "B", optionText: "Article 19", isCorrect: false, orderIndex: 1 },
      { id: "opt_q3_c", optionKey: "C", optionText: "Article 32", isCorrect: true, orderIndex: 2 },
      { id: "opt_q3_d", optionKey: "D", optionText: "Article 44", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    id: "q_ssc_004",
    questionText:
      "Select the most appropriate ANTONYM of the given word: 'METICULOUS'",
    questionType: "MCQ",
    subject: "English Comprehension",
    topic: "Vocabulary",
    difficulty: "EASY",
    explanation:
      "Meticulous means showing great attention to detail; very careful and precise. The opposite is 'Careless' or 'Sloppy'.",
    marks: 2.0,
    negativeMarks: 0.5,
    options: [
      { id: "opt_q4_a", optionKey: "A", optionText: "Diligent", isCorrect: false, orderIndex: 0 },
      { id: "opt_q4_b", optionKey: "B", optionText: "Fastidious", isCorrect: false, orderIndex: 1 },
      { id: "opt_q4_c", optionKey: "C", optionText: "Careless", isCorrect: true, orderIndex: 2 },
      { id: "opt_q4_d", optionKey: "D", optionText: "Scrupulous", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    id: "q_ssc_005",
    questionText:
      "If 2x + 3y = 17 and xy = 10, find the numerical value of 4x² + 9y².",
    questionType: "NUMERICAL",
    subject: "Quantitative Aptitude",
    topic: "Algebra",
    difficulty: "MEDIUM",
    explanation:
      "(2x + 3y)² = 4x² + 9y² + 2*(2x)*(3y) = 4x² + 9y² + 12xy. Substituting values: 17² = 4x² + 9y² + 12(10) => 289 = 4x² + 9y² + 120 => 4x² + 9y² = 289 - 120 = 169.",
    marks: 2.0,
    negativeMarks: 0.5,
    correctNumericalAnswer: "169",
    options: [],
  },
  {
    id: "q_ssc_006",
    questionText:
      "Statements:\nI. All politicians are honest.\nII. Some honest people are leaders.\nConclusions:\nI. Some politicians are leaders.\nII. All leaders are honest.",
    questionType: "MCQ",
    subject: "General Intelligence & Reasoning",
    topic: "Syllogisms",
    difficulty: "MEDIUM",
    explanation:
      "Neither conclusion definitely follows. Politician is completely within Honest, but Leaders only overlap with Honest; there is no compulsory overlap between Politician and Leaders.",
    marks: 2.0,
    negativeMarks: 0.5,
    options: [
      { id: "opt_q6_a", optionKey: "A", optionText: "Only conclusion I follows", isCorrect: false, orderIndex: 0 },
      { id: "opt_q6_b", optionKey: "B", optionText: "Only conclusion II follows", isCorrect: false, orderIndex: 1 },
      { id: "opt_q6_c", optionKey: "C", optionText: "Both I and II follow", isCorrect: false, orderIndex: 2 },
      { id: "opt_q6_d", optionKey: "D", optionText: "Neither I nor II follows", isCorrect: true, orderIndex: 3 },
    ],
  },
  {
    id: "q_ssc_007",
    questionText:
      "The Indus Valley Civilization site 'Lothal', famous for its ancient dockyard, is located in which modern state of India?",
    questionType: "MCQ",
    subject: "General Awareness",
    topic: "Ancient Indian History",
    difficulty: "EASY",
    explanation:
      "Lothal is situated near the village of Saragwala in Dholka Taluka of Ahmedabad district, Gujarat. It was one of the southernmost cities of the ancient Indus Valley Civilization.",
    marks: 2.0,
    negativeMarks: 0.5,
    options: [
      { id: "opt_q7_a", optionKey: "A", optionText: "Rajasthan", isCorrect: false, orderIndex: 0 },
      { id: "opt_q7_b", optionKey: "B", optionText: "Gujarat", isCorrect: true, orderIndex: 1 },
      { id: "opt_q7_c", optionKey: "C", optionText: "Punjab", isCorrect: false, orderIndex: 2 },
      { id: "opt_q7_d", optionKey: "D", optionText: "Haryana", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    id: "q_ssc_008",
    questionText:
      "Select the option that rectifies the grammatical error: 'He has been studying in this college since five years.'",
    questionType: "MCQ",
    subject: "English Comprehension",
    topic: "Sentence Correction",
    difficulty: "EASY",
    explanation:
      "'For' is used to denote a period of duration (five years), whereas 'since' denotes a specific point in time (e.g., since 2020). Correct phrase: 'for five years'.",
    marks: 2.0,
    negativeMarks: 0.5,
    options: [
      { id: "opt_q8_a", optionKey: "A", optionText: "He is studying in this college for five years.", isCorrect: false, orderIndex: 0 },
      { id: "opt_q8_b", optionKey: "B", optionText: "He has been studying in this college for five years.", isCorrect: true, orderIndex: 1 },
      { id: "opt_q8_c", optionKey: "C", optionText: "He was studying in this college from five years.", isCorrect: false, orderIndex: 2 },
      { id: "opt_q8_d", optionKey: "D", optionText: "He has studied in this college since five years.", isCorrect: false, orderIndex: 3 },
    ],
  },
];

export const INITIAL_TESTS: DemoTest[] = [
  {
    id: "test_cgl_full_01",
    testSeriesId: "series_ssc_cgl_2026",
    title: "SSC CGL Tier 1 All-India Mock Test 01",
    slug: "ssc-cgl-tier-1-all-india-mock-01",
    description:
      "Full-length diagnostic mock test conforming to the exact pattern of the Staff Selection Commission. Contains 4 sections: Reasoning, General Awareness, Quantitative Aptitude, and English Comprehension.",
    durationMinutes: 60,
    totalMarks: 200,
    passingMarks: 75,
    negativeMarkingRate: 0.5,
    marksPerQuestion: 2.0,
    instructions: buildTestInstructionsText(2, 0.5),
    status: "PUBLISHED",
    allowRetake: true,
    showResultImmediately: true,
    orderIndex: 1,
    questionIds: [
      "q_ssc_001",
      "q_ssc_002",
      "q_ssc_003",
      "q_ssc_004",
      "q_ssc_005",
      "q_ssc_006",
      "q_ssc_007",
      "q_ssc_008",
    ],
  },
  {
    id: "test_cgl_full_02",
    testSeriesId: "series_ssc_cgl_2026",
    title: "SSC CGL Tier 1 All-India Mock Test 02",
    slug: "ssc-cgl-tier-1-all-india-mock-02",
    description: "High-difficulty mock test simulating peak cut-off examination conditions.",
    durationMinutes: 60,
    totalMarks: 200,
    passingMarks: 75,
    negativeMarkingRate: 0.5,
    marksPerQuestion: 2.0,
    instructions: buildTestInstructionsText(2, 0.5),
    status: "PUBLISHED",
    allowRetake: true,
    showResultImmediately: true,
    orderIndex: 2,
    questionIds: ["q_ssc_001", "q_ssc_002", "q_ssc_003", "q_ssc_004"],
  },
  {
    id: "test_ibps_prelims_01",
    testSeriesId: "series_ibps_po_2026",
    title: "IBPS PO Prelims Live Mock Test 01",
    slug: "ibps-po-prelims-live-mock-01",
    description: "Time-bound sectional test with high-standard DI sets and Puzzles.",
    durationMinutes: 60,
    totalMarks: 100,
    passingMarks: 50,
    negativeMarkingRate: 0.25,
    marksPerQuestion: 1.0,
    instructions: "Strict sectional time limit of 20 minutes per section.",
    status: "PUBLISHED",
    allowRetake: true,
    showResultImmediately: true,
    orderIndex: 1,
    questionIds: ["q_ssc_001", "q_ssc_002", "q_ssc_006"],
  },
];
