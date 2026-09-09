import Link from "next/link";
import { getTestSeriesList, getCategories } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Layers, Zap, Star, ArrowRight, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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
  const testSeriesList = await getTestSeriesList({
    categorySlug,
    difficulty,
    search,
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <Badge variant="outline" className="mb-2 uppercase tracking-widest text-[10px]">
          Catalog & Marketplace
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Government Exam Test Series
        </h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Comprehensive, TCS-patterned mock tests for Central and State government competitive exams.
          Each series includes full-length tests, sectional tests, and detailed question explanations.
        </p>
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
                <div className="relative h-44 w-full overflow-hidden bg-muted">
                  <img
                    src={
                      series.thumbnail ||
                      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"
                    }
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
                    Instant Access
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
