import { notFound } from "next/navigation";
import Link from "next/link";
import { getTestSeriesBySlug, hasUserPurchasedSeries } from "@/lib/data/store";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "@/components/checkout-button";
import {
  Layers,
  Timer,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Star,
  Award,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { formatCurrency, formatDuration } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TestSeriesDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const series = await getTestSeriesBySlug(slug);

  if (!series) {
    notFound();
  }

  const session = await getSession();
  const isPurchased = session
    ? await hasUserPurchasedSeries(session.id, series.id)
    : false;

  const effectivePrice =
    series.discountPrice && series.discountPrice > 0
      ? series.discountPrice
      : series.price;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 font-medium">
        <Link href="/test-series" className="hover:text-foreground">
          Test Series
        </Link>
        <span>/</span>
        <span className="text-foreground">{series.examName}</span>
        <span>/</span>
        <span className="truncate max-w-xs">{series.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-10">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary text-primary-foreground text-xs font-semibold">
                {series.examName}
              </Badge>
              <Badge variant="outline" className="text-xs font-mono">
                {series.language}
              </Badge>
              <Badge variant="outline" className="text-xs font-mono">
                {series.difficulty}
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {series.title}
            </h1>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm">{series.rating.toFixed(1)}</span>
                <span className="text-muted-foreground font-normal">
                  ({series.ratingCount} aspirants rated)
                </span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                Target: 2026 Recruitment Exams
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed pt-2">
              {series.description}
            </p>
          </div>

          {/* Key Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 rounded-xl border border-border bg-card">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-medium">
                Total Tests
              </p>
              <p className="text-lg font-bold font-mono text-foreground">
                {series.totalTestsCount} Mocks
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-medium">
                Questions
              </p>
              <p className="text-lg font-bold font-mono text-foreground">
                {series.totalQuestionsCount}+
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-medium">
                Pattern
              </p>
              <p className="text-lg font-bold font-mono text-foreground">
                TCS iON CBT
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-medium">
                Validity
              </p>
              <p className="text-lg font-bold font-mono text-foreground">
                12 Months
              </p>
            </div>
          </div>

          {/* Included Tests List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Included Tests ({series.tests?.length || 0})</h2>
              <span className="text-xs text-muted-foreground">
                Official Exam Pattern & Marking Scheme
              </span>
            </div>

            <div className="space-y-3">
              {series.tests?.map((test, index) => (
                <div
                  key={test.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-foreground/20 transition-all gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">
                        {test.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Timer className="h-3 w-3" />
                          {formatDuration(test.durationMinutes)}
                        </span>
                        <span>•</span>
                        <span className="font-mono">
                          {test.totalMarks} Marks
                        </span>
                        <span>•</span>
                        <span>
                          +{test.marksPerQuestion} / -{test.negativeMarkingRate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isPurchased ? (
                      <Link href={`/student/tests/${test.id}/instructions`}>
                        <Button size="sm" className="w-full sm:w-auto h-8 text-xs font-semibold gap-1">
                          Take Test
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    ) : (
                      <Badge variant="outline" className="text-[11px] text-muted-foreground">
                        Included in Series
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Pattern & Syllabus Info */}
          <div className="p-6 rounded-xl border border-border bg-card space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Syllabus & Test Architecture
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Section 1: General Intelligence & Reasoning</p>
                <p>Analogies, Syllogisms, Coding-Decoding, Venn Diagrams, Spatial Visualization.</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Section 2: Quantitative Aptitude</p>
                <p>Arithmetic (Percentage, Profit & Loss, Ratio), Algebra, Geometry, Mensuration & DI.</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Section 3: English Comprehension</p>
                <p>Error Spotting, Idioms, Active/Passive Voice, Cloze Test, Reading Passages.</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Section 4: General Awareness</p>
                <p>Indian Polity, Modern History, Geography, General Science, Current Affairs.</p>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-bold text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Frequently Asked Questions
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-lg border border-border/70 bg-muted/20 space-y-1">
                <p className="font-semibold text-foreground">Can I take the tests on my phone or tablet?</p>
                <p className="text-muted-foreground leading-relaxed">
                  Yes, QuickTestWala is engineered to be 100% responsive. You can attempt tests smoothly on desktops, laptops, tablets, or mobile devices.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/70 bg-muted/20 space-y-1">
                <p className="font-semibold text-foreground">What happens if my internet disconnects during a test?</p>
                <p className="text-muted-foreground leading-relaxed">
                  Every question you answer is saved automatically to the database. If disconnected, simply refresh or log back in; your timer and saved answers will resume seamlessly.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/70 bg-muted/20 space-y-1">
                <p className="font-semibold text-foreground">Are solutions provided for every question?</p>
                <p className="text-muted-foreground leading-relaxed">
                  Yes. Immediately upon submitting any test, you receive full step-by-step mathematical proofs, grammar rules, and historical references for all questions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Sticky Purchase Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border border-border bg-card p-6 shadow-md space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Full Series Pass
              </span>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-extrabold font-mono text-foreground">
                  {formatCurrency(effectivePrice)}
                </span>
                {series.discountPrice && series.discountPrice < series.price && (
                  <span className="text-sm font-mono text-muted-foreground line-through">
                    {formatCurrency(series.price)}
                  </span>
                )}
                {series.discountPrice && series.discountPrice < series.price && (
                  <Badge variant="success" className="text-[10px]">
                    Save {Math.round(((series.price - series.discountPrice) / series.price) * 100)}%
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                One-time payment • No recurring charges • 1 Year Unlimited Access
              </p>
            </div>

            <CheckoutButton
              testSeriesId={series.id}
              price={effectivePrice}
              isPurchased={isPurchased}
              isLoggedIn={Boolean(session)}
            />

            <div className="space-y-3 pt-4 border-t border-border/80 text-xs">
              <div className="flex items-center gap-2.5 text-foreground font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{series.totalTestsCount} Complete Mock Tests</span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>All-India Rank & Percentile Report</span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Sectional Speed & Accuracy Breakdown</span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Unlimited Test Retakes</span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Secure Payment Gateway (Razorpay/UPI)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
