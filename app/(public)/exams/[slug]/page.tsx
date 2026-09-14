import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, BookOpen, BriefcaseBusiness, CalendarRange, CheckCircle2, Landmark, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const examCatalog = {
  "ssc-cgl": {
    name: "SSC CGL",
    fullName: "Staff Selection Commission Combined Graduate Level",
    category: "SSC",
    logo: "https://ssc.gov.in/assets/sscLogo.webp",
    summary:
      "SSC CGL is a national-level recruitment exam for Group B and C posts in the central government. It is one of the most competitive and high-demand government exams in India.",
    vacancies: "12,256 (2026 cycle)",
    examDate: "30 Sep – 30 Oct 2026",
    notification: "21 May 2026",
    eligibility: "Bachelor’s degree from a recognized university",
    ageLimit: "18 to 32 years (age relaxation applicable as per category)",
    salary: "₹25,500 to ₹1,42,400 per month depending on post and pay level",
    stages: [
      { title: "Tier I", detail: "Computer-based objective test; qualifying stage" },
      { title: "Tier II", detail: "Computer-based main exam with higher weightage" },
      { title: "Document Verification", detail: "Verification of identity, qualification and category documents" },
    ],
    pattern: [
      { label: "Tier I", value: "General Intelligence & Reasoning, General Awareness, Quantitative Aptitude, English Comprehension" },
      { label: "Tier II", value: "Quantitative Aptitude, English Language & Comprehension, Statistics / Finance depending on post" },
    ],
    tierOnePattern: [
      { subject: "General Intelligence and Reasoning", questions: 25, marks: 50, duration: "60 minutes" },
      { subject: "General Awareness", questions: 25, marks: 50, duration: "60 minutes" },
      { subject: "Quantitative Aptitude", questions: 25, marks: 50, duration: "60 minutes" },
      { subject: "English Comprehension", questions: 25, marks: 50, duration: "60 minutes" },
      { subject: "Total", questions: 100, marks: 200, duration: "60 minutes" },
    ],
    tierTwoPattern: [
      { subject: "Quantitative Abilities", questions: 30, marks: 90, duration: "2 hours 30 mins" },
      { subject: "General Intelligence and Reasoning", questions: 30, marks: 90, duration: "2 hours 30 mins" },
      { subject: "English Language and Comprehension", questions: 45, marks: 135, duration: "2 hours 30 mins" },
      { subject: "General Awareness", questions: 25, marks: 75, duration: "2 hours 30 mins" },
      { subject: "Total (Paper 1)", questions: 130, marks: 390, duration: "2 hours 30 mins" },
      { subject: "Statistics (for JSO posts)", questions: 100, marks: 200, duration: "2 hours" },
      { subject: "General Studies (Finance & Economics)", questions: 100, marks: 200, duration: "2 hours" },
    ],
    keyFacts: [
      "Conducting body: Staff Selection Commission",
      "Mode: Online CBT",
      "Frequency: Annual",
      "Selection: Merit-based through multiple tiers",
    ],
  },
  "rrb-ntpc": {
    name: "RRB NTPC",
    fullName: "Railway Recruitment Boards Non-Technical Popular Categories",
    category: "Railways",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/88/Indian_Railways_Logo.svg",
    summary:
      "RRB NTPC recruits candidates for technical and non-technical posts in Indian Railways such as Station Master, Goods Guard, Commercial Apprentice, and Assistant.",
    vacancies: "Varies by recruitment cycle",
    examDate: "CBT-1 and CBT-2 dates released by RRBs as per notification",
    notification: "Updated by RRBs annually",
    eligibility: "12th pass / graduate depending on post",
    ageLimit: "18 to 33 years (varies by post and category)",
    salary: "₹19,900 to ₹1,12,400 depending on pay level and post",
    stages: [
      { title: "CBT 1", detail: "General awareness, arithmetic, reasoning, and aptitude" },
      { title: "CBT 2", detail: "Higher difficulty level and post-specific syllabus" },
      { title: "Typing / Skill / CBAT", detail: "Applicable only for selected post categories" },
    ],
    pattern: [
      { label: "CBT 1", value: "Mathematics, General Intelligence & Reasoning, General Awareness" },
      { label: "CBT 2", value: "Higher-level Mathematics, Reasoning, General Awareness and post-specific focus" },
    ],
    keyFacts: [
      "Conducting body: Indian Railways (RRBs)",
      "Mode: Online CBT",
      "Frequency: Open recruitment cycles",
      "Selection: CBT + Skill / Document verification as applicable",
    ],
  },
  upsc: {
    name: "UPSC CSE",
    fullName: "Union Public Service Commission Civil Services Examination",
    category: "UPSC",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Emblem_of_India.svg",
    summary:
      "UPSC Civil Services Examination is India’s premier public service exam for IAS, IPS, IFS, and other prestigious central government positions.",
    vacancies: "Approximate annual intake varies by year and service allocation",
    examDate: "Annual cycle; prelims typically conducted in May/June",
    notification: "Usually released in February",
    eligibility: "Graduate degree from a recognized university",
    ageLimit: "21 to 32 years (age relaxations as per category)",
    salary: "₹56,100 to ₹2,50,000+ depending on rank, service and allowances",
    stages: [
      { title: "Prelims", detail: "General Studies and CSAT; objective type" },
      { title: "Mains", detail: "Written descriptive papers on GS, essay and optional subjects" },
      { title: "Interview", detail: "Personality test and final service allocation" },
    ],
    pattern: [
      { label: "Prelims", value: "GS Paper I and CSAT (objective)" },
      { label: "Mains", value: "General Studies, Essay, Optional Subject papers, language papers" },
      { label: "Interview", value: "Personality, aptitude, communication and suitability assessment" },
    ],
    keyFacts: [
      "Conducting body: UPSC",
      "Mode: Offline written plus interview",
      "Frequency: Annual",
      "Selection: Prelims → Mains → Interview → Final ranking",
    ],
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exam = examCatalog[slug as keyof typeof examCatalog];

  if (!exam) {
    return {
      title: "Exam not found",
    };
  }

  return {
    title: `${exam.name} Exam Details 2026 | TestHero`,
    description: `${exam.name} details, exam pattern, vacancies, eligibility, salary, and recruitment stages.`,
  };
}

export default async function ExamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exam = examCatalog[slug as keyof typeof examCatalog];

  if (!exam) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="mb-8 flex items-center justify-between gap-3">
        <Link href="/exams">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to exams
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-gradient-to-r from-slate-50 via-white to-sky-50 p-6 dark:from-slate-900 dark:via-background dark:to-sky-950">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-white p-2 shadow-sm dark:bg-slate-900">
                <img src={exam.logo} alt={exam.name} className="h-full w-full object-contain" />
              </div>
              <div>
                <Badge variant="outline" className="mb-2 uppercase tracking-[0.2em] text-[10px]">
                  {exam.category}
                </Badge>
                <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                  {exam.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{exam.fullName}</p>
              </div>
            </div>

            <Badge className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              {exam.examDate}
            </Badge>
          </div>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          <section>
            <p className="text-base leading-7 text-muted-foreground">{exam.summary}</p>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <CalendarRange className="h-3.5 w-3.5" />
                Exam date
              </div>
              <p className="text-sm font-bold text-foreground">{exam.examDate}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Vacancies
              </div>
              <p className="text-sm font-bold text-foreground">{exam.vacancies}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Eligibility
              </div>
              <p className="text-sm font-bold text-foreground">{exam.eligibility}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                Salary
              </div>
              <p className="text-sm font-bold text-foreground">{exam.salary}</p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                <Award className="h-4 w-4 text-amber-500" />
                Quick facts
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {exam.keyFacts.map((fact) => (
                  <li key={fact} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                <Landmark className="h-4 w-4 text-blue-500" />
                Important dates
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 p-3">
                  <span>Notification</span>
                  <span className="font-semibold text-foreground">{exam.notification}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 p-3">
                  <span>Age limit</span>
                  <span className="font-semibold text-foreground">{exam.ageLimit}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-background p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
              <BriefcaseBusiness className="h-4 w-4 text-violet-500" />
              Selection process
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {exam.stages.map((stage, index) => (
                <div key={stage.title} className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                      {index + 1}
                    </span>
                    {stage.title}
                  </div>
                  <p className="text-sm text-foreground">{stage.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-background p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
              <BookOpenIcon />
              Exam pattern
            </div>

            {exam.name === "SSC CGL" ? (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-base font-bold text-foreground">SSC CGL Tier 1 Exam Pattern 2026</h3>
                  <div className="overflow-hidden rounded-xl border border-border">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-foreground">Subject</th>
                            <th className="px-4 py-3 font-semibold text-foreground">No of Questions</th>
                            <th className="px-4 py-3 font-semibold text-foreground">Maximum Marks</th>
                            <th className="px-4 py-3 font-semibold text-foreground">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exam.tierOnePattern.map((row) => (
                            <tr key={row.subject} className="border-t border-border">
                              <td className="px-4 py-3 text-foreground">{row.subject}</td>
                              <td className="px-4 py-3 text-muted-foreground">{row.questions}</td>
                              <td className="px-4 py-3 text-muted-foreground">{row.marks}</td>
                              <td className="px-4 py-3 text-muted-foreground">{row.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-base font-bold text-foreground">SSC CGL Tier 2 Exam Pattern 2026</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Paper 1 is compulsory for all candidates. Paper 2 and Paper 3 apply only to specific posts such as JSO and AAO.
                  </p>
                  <div className="overflow-hidden rounded-xl border border-border">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-foreground">Paper</th>
                            <th className="px-4 py-3 font-semibold text-foreground">Subject</th>
                            <th className="px-4 py-3 font-semibold text-foreground">No of Questions</th>
                            <th className="px-4 py-3 font-semibold text-foreground">Maximum Marks</th>
                            <th className="px-4 py-3 font-semibold text-foreground">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exam.tierTwoPattern.map((row) => (
                            <tr key={row.subject} className="border-t border-border align-top">
                              <td className="px-4 py-3 text-foreground">
                                {row.subject.includes("Total") ? "Paper 1" : row.subject.includes("Statistics") ? "Paper 2" : row.subject.includes("General Studies") ? "Paper 3" : "Paper 1"}
                              </td>
                              <td className="px-4 py-3 text-foreground">{row.subject}</td>
                              <td className="px-4 py-3 text-muted-foreground">{row.questions}</td>
                              <td className="px-4 py-3 text-muted-foreground">{row.marks}</td>
                              <td className="px-4 py-3 text-muted-foreground">{row.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {exam.pattern.map((row) => (
                  <div key={row.label} className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {row.label}
                    </p>
                    <p className="text-sm text-foreground">{row.value}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function BookOpenIcon() {
  return <BookOpen className="h-4 w-4 text-cyan-500" />;
}
