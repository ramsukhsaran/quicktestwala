import Link from "next/link";
import { getTestSeriesList, getCategories } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Layers, Zap, Star, ArrowRight, Filter, Crown, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const featuredExamConfig = {
  name: "SSC CGL",
  year: 2026,
  logoUrl: "https://ssc.gov.in/assets/sscLogo.webp",
  badge: "SSC CGL 2026 Exam Date Out",
  examDate: "30 Sep – 30 Oct 2026",
  vacancies: "12,256",
  eligibility: "Bachelor’s degree; age varies by post and category",
  selectionProcess: "Tier I → Tier II → Document Verification",
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
    search?: string;
  }>;
}

export default async function TestSeriesMarketplacePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.category;
  const difficulty = resolvedParams.difficulty;
  const search = resolvedParams.search;

  const categories = await getCategories();
  const rawTestSeriesList = await getTestSeriesList({
    categorySlug,
    difficulty,
    search,
  });

  const testSeriesList = rawTestSeriesList.filter(
    (s) => s.id !== "pro_access_all_series" && s.slug !== "pro-full-access" && s.slug !== "pro-access-membership-system"
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
      {/* Header */}
      <div className="max-w-3xl mb-8">
        <Badge variant="outline" className="mb-2 uppercase tracking-widest text-[10px]">
          Catalog & Marketplace
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Government Exam Test Series
        </h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Comprehensive, Real Exam-patterned mock tests for Central and State government competitive exams.
          Each series includes full-length tests, sectional tests, and detailed question explanations.
        </p>
      </div>

      {/* Pro Membership Banner */}
      <div className="mb-8 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-50 via-white to-indigo-50 dark:from-purple-950/40 dark:via-background dark:to-indigo-950/30 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-600 text-white text-[10px] font-bold gap-1">
                <Crown className="h-3 w-3" /> QuickTestWala Pro Membership
              </Badge>
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">1-Year All Exam Pass • ₹999</span>
            </div>
            <h3 className="text-base font-bold text-foreground">
              Preparing for multiple competitive exams? Unlock all test series at once.
            </h3>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Get unlimited 365-day access to every current and upcoming test series, full-length CBT mock tests, and official previous year question papers.
            </p>
          </div>
          <Link href="/pricing?plan=pro" className="shrink-0">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold gap-1.5 shadow-sm">
              <Crown className="h-3.5 w-3.5" />
              Explore Pro Membership
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-border bg-gradient-to-r from-slate-50 via-white to-sky-50 p-5 shadow-sm dark:from-slate-900 dark:via-background dark:to-sky-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-white p-2 shadow-sm dark:bg-slate-900">
              <img
                src={featuredExamConfig.logoUrl}
                alt={`${featuredExamConfig.name} ${featuredExamConfig.year} logo`}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Featured exam
              </p>
              <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                {featuredExamConfig.badge}
              </h2>
            </div>
          </div>

          <Badge className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            Updated for {featuredExamConfig.year}
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-background/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Exam date
            </p>
            <p className="mt-2 text-sm font-bold text-foreground">{featuredExamConfig.examDate}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Vacancies
            </p>
            <p className="mt-2 text-sm font-bold text-foreground">{featuredExamConfig.vacancies}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Eligibility
            </p>
            <p className="mt-2 text-sm font-bold text-foreground">{featuredExamConfig.eligibility}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Selection process
            </p>
            <p className="mt-2 text-sm font-bold text-foreground">{featuredExamConfig.selectionProcess}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 mb-8 shadow-sm space-y-4">
        <form method="GET" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Search by exam name (e.g. SSC CGL, IBPS PO, RRB NTPC)..."
              defaultValue={search || ""}
              className="pl-9 h-10 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              name="difficulty"
              defaultValue={difficulty || ""}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            <Button type="submit" className="h-10 px-5 text-xs font-semibold">
              Filter
            </Button>
          </div>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground font-medium shrink-0 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Verticals:
          </span>
          <Link
            href="/test-series"
            className={`px-3 py-1 rounded-full border transition-colors shrink-0 ${
              !categorySlug
                ? "bg-foreground text-background border-foreground font-semibold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => {
            const isActive = categorySlug === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/test-series?category=${cat.slug}${difficulty ? `&difficulty=${difficulty}` : ""}`}
                className={`px-3 py-1 rounded-full border transition-colors shrink-0 ${
                  isActive
                    ? "bg-foreground text-background border-foreground font-semibold"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid of Test Series */}
      {testSeriesList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <h3 className="text-base font-semibold text-foreground">No test series found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category from the filters above.
          </p>
          <Link href="/test-series" className="inline-block mt-4">
            <Button variant="outline" size="sm" className="text-xs">
              Reset Filters
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testSeriesList.map((series) => (
            <Card
              key={series.id}
              className="flex flex-col justify-between overflow-hidden border-border hover:border-foreground/25 hover:shadow-lg transition-all group"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-muted/40 dark:bg-muted/20 border-b border-border/40 flex items-center justify-center p-4">
                  {/* Ambient blurred backdrop */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                    <img
                      src={
                        series.thumbnail ||
                        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"
                      }
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover opacity-15 blur-xl scale-125 dark:opacity-20"
                    />
                    <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px]" />
                  </div>

                  {/* Clean uncropped image */}
                  <img
                    src={
                      series.thumbnail ||
                      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"
                    }
                    alt={series.title}
                    loading="lazy"
                    className="relative z-10 max-h-32 max-w-[85%] w-auto h-auto object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 z-20">
                    <Badge className="bg-background/90 backdrop-blur-md text-foreground border border-border/50 text-[11px] font-semibold shadow-sm">
                      {series.examName}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 z-20">
                    <Badge variant="outline" className="bg-background/90 backdrop-blur-md text-[10px] font-mono border-border/50 shadow-sm">
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
                      <span>{series.totalTestsCount} Mock Tests</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5" />
                      <span>{series.language}</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-5 pt-3 border-t border-border/60 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    {(series.discountPrice === 0 || series.price === 0) ? (
                      <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        FREE
                      </span>
                    ) : (
                      <>
                        <span className="text-xl font-bold font-mono text-foreground">
                          {formatCurrency(series.discountPrice || series.price)}
                        </span>
                        {series.discountPrice && series.discountPrice < series.price && (
                          <span className="text-xs text-muted-foreground line-through font-mono">
                            {formatCurrency(series.price)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {(series.discountPrice === 0 || series.price === 0) ? "Free Practice" : "Instant Access"}
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
      )}
    </div>
  );
}
