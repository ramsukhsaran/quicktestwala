import Link from "next/link";
import { getTestSeriesList, getCategories } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Timer,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Layers,
  Award,
  BookOpen,
  Building2,
  Train,
  GraduationCap,
  Landmark,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function HomePage() {
  const featuredSeries = await getTestSeriesList({ isFeatured: true });
  const categories = await getCategories();

  const iconMap: Record<string, any> = {
    Award,
    Building2,
    Train,
    GraduationCap,
    Landmark,
    Shield,
    BookOpen,
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-border/80 bg-background pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm mb-8 transition-all hover:bg-muted">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>2026 CBT Pattern Live: SSC, Banking & RRB</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.08]">
            Prepare Smarter. <br />
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
              Perform Better.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
            Developer-grade mock tests for India&apos;s competitive government exams.
            Practice with an authentic CBT engine, live negative marking, and
            deep sectional analytics.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/test-series">
              <Button size="lg" className="h-12 px-8 text-sm font-semibold rounded-lg shadow-md w-full sm:w-auto">
                Explore Test Series
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-sm font-semibold rounded-lg w-full sm:w-auto border-border hover:bg-accent"
              >
                Try Free Mock Test
              </Button>
            </Link>
          </div>

          {/* Social Proof metrics */}
          <div className="mt-16 pt-12 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-6 text-left max-w-4xl mx-auto">
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                500,000+
              </p>
              <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                Mock Tests Attempted
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                99.98%
              </p>
              <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                CBT Engine Uptime
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                10,000+
              </p>
              <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                Verified Questions
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                4.9 / 5.0
              </p>
              <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                Aspirant Rating
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CBT INTERACTIVE TEASER PREVIEW */}
      <section className="py-16 border-b border-border bg-muted/20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="mb-2 uppercase tracking-widest text-[10px]">
              Engine Architecture
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              An Authentic CBT Examination Terminal
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Engineered to duplicate actual examination center interfaces (TCS iON pattern) so you face zero surprises on exam day.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-xl overflow-hidden max-w-4xl mx-auto">
            {/* Mock CBT Topbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-foreground">SSC CGL Tier-1 CBT Mock Simulation</span>
                <span className="hidden sm:inline-block text-muted-foreground">|</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-background border text-[11px] font-mono">
                  General Intelligence & Reasoning
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-mono font-semibold px-2.5 py-1 rounded bg-background border text-foreground">
                  <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>58:42</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500" title="Online & Auto-saving" />
              </div>
            </div>

            {/* Mock Question Area & Palette */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Question */}
              <div className="p-6 md:col-span-2 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Question No. 1</span>
                  <div className="flex gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">+2.00</span>
                    <span className="text-rose-600 dark:text-rose-400 font-mono">-0.50</span>
                  </div>
                </div>

                <p className="text-sm font-medium leading-relaxed">
                  In a certain code language, if &apos;COMPUTER&apos; is coded as &apos;RFUVQNPC&apos;, how will &apos;MEDICINE&apos; be coded in that language?
                </p>

                <div className="space-y-2 pt-2">
                  {["EOJDEJFM", "EOJDJEFM", "MFEDJJOE", "MFEJDJOE"].map((opt, i) => (
                    <div
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                        i === 1
                          ? "border-foreground bg-accent/50 font-medium"
                          : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center text-[10px] ${
                          i === 1 ? "border-foreground bg-foreground text-background" : "border-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border/80 text-xs">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Mark for Review
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Clear Response
                    </Button>
                  </div>
                  <Button size="sm" className="h-7 text-xs font-semibold">
                    Save & Next
                  </Button>
                </div>
              </div>

              {/* Palette */}
              <div className="p-4 bg-muted/20 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Question Palette
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { num: 1, state: "answered" },
                    { num: 2, state: "review" },
                    { num: 3, state: "not-visited" },
                    { num: 4, state: "not-visited" },
                    { num: 5, state: "not-visited" },
                    { num: 6, state: "not-visited" },
                    { num: 7, state: "not-visited" },
                    { num: 8, state: "not-visited" },
                    { num: 9, state: "not-visited" },
                    { num: 10, state: "not-visited" },
                  ].map((item) => (
                    <div
                      key={item.num}
                      className={`h-8 rounded flex items-center justify-center text-xs font-mono font-medium border cursor-pointer ${
                        item.state === "answered"
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold"
                          : item.state === "review"
                          ? "bg-purple-500/15 border-purple-500 text-purple-700 dark:text-purple-300 font-bold"
                          : "bg-background border-border text-muted-foreground"
                      }`}
                    >
                      {item.num}
                    </div>
                  ))}
                </div>

                <div className="text-[11px] space-y-1.5 pt-2 border-t border-border text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500" />
                    <span>Answered (1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-purple-500/20 border border-purple-500" />
                    <span>Marked for Review (1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-background border" />
                    <span>Not Visited (8)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR EXAM CATEGORIES */}
      <section className="py-20 border-b border-border bg-background">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="outline" className="mb-2 uppercase tracking-widest text-[10px]">
                Exam Verticals
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Popular Competitive Exams</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Curated test series strictly aligned with official exam notifications and latest syllabus.
              </p>
            </div>
            <Link href="/exams">
              <Button variant="ghost" size="sm" className="text-xs">
                View All Verticals
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const iconKey = typeof cat.icon === "string" ? cat.icon : "Award";
              const IconComp = (iconMap as Record<string, any>)[iconKey] || Award;
              return (
                <Link
                  key={cat.id}
                  href={`/test-series?category=${cat.slug}`}
                  className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/30 hover:shadow-md"
                >
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-foreground mb-4 group-hover:scale-105 transition-transform">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED TEST SERIES */}
      <section className="py-20 border-b border-border bg-muted/10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="outline" className="mb-2 uppercase tracking-widest text-[10px]">
                High Yield
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Featured Mock Test Series</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Full-length mock tests modeled with precision for upcoming 2026 exam cycles.
              </p>
            </div>
            <Link href="/test-series">
              <Button variant="outline" size="sm" className="text-xs">
                Browse Marketplace
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSeries.map((series) => (
              <Card
                key={series.id}
                className="flex flex-col justify-between overflow-hidden border-border hover:border-foreground/25 hover:shadow-lg transition-all group"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-muted">
                    <img
                      src={series.thumbnail || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"}
                      alt={series.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-background/90 backdrop-blur-md text-foreground border-border text-[11px] font-semibold">
                        {series.examName}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="bg-background/90 text-[10px] font-mono">
                        {series.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="p-5 pb-2">
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{series.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({series.ratingCount})</span>
                    </div>
                    <CardTitle className="text-base font-bold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {series.title}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1.5">
                      {series.shortDescription}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-5 py-3">
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" />
                        <span>{series.totalTestsCount} Tests Included</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5" />
                        <span>Instant Solutions</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-3 border-t border-border/60 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold font-mono text-foreground">
                        {formatCurrency(series.discountPrice || series.price)}
                      </span>
                      {series.discountPrice && series.discountPrice < series.price && (
                        <span className="text-xs text-muted-foreground line-through font-mono">
                          {formatCurrency(series.price)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      One-time access
                    </span>
                  </div>

                  <Link href={`/test-series/${series.slug}`}>
                    <Button size="sm" className="h-9 px-4 text-xs font-semibold">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHY QUICKTESTWALA / KEY PILLARS */}
      <section className="py-20 border-b border-border bg-background">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-2 uppercase tracking-widest text-[10px]">
              The QuickTestWala Standard
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Designed for Serious Aspirants
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Every feature is built around the strict constraints and psychological conditions of actual government examinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 p-6 rounded-xl border border-border bg-card">
              <div className="h-10 w-10 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                <Timer className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Sectional Countdown Timers</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Persisted exam clock surviving browser refreshes, tab closures, and accidental disconnects. Auto-submits strictly at zero seconds.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-xl border border-border bg-card">
              <div className="h-10 w-10 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Anti-Loss State Persistence</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every choice and marked review is debounced and synchronized to Neon PostgreSQL in real-time. Resume immediately without losing a single mark.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-xl border border-border bg-card">
              <div className="h-10 w-10 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Percentile & Accuracy Metrics</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Post-test diagnostic scorecards tracking accuracy vs guessing, time wasted on incorrect questions, and sectional cutoff simulations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 bg-muted/30 border-b border-border text-center">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Start Your Examination Journey Today
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join thousands of students preparing with high-yield mock tests and modern CBT examination tools.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-sm font-semibold rounded-lg shadow-md w-full sm:w-auto">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/test-series">
              <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-semibold rounded-lg w-full sm:w-auto">
                Browse All Mock Series
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
