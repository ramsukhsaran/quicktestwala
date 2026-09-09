import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { getUserOrders, getTestSeriesList } from "@/lib/data/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, ArrowRight, BookOpenCheck, ShoppingBag } from "lucide-react";

export default async function StudentTestSeriesPage() {
  const session = await requireAuth();
  const orders = await getUserOrders(session.id);
  const paidOrders = orders.filter((o) => o.status === "PAID");

  const enrolledSeries = paidOrders.map((o) => o.testSeries).filter(Boolean);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Enrolled Test Series</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Access all purchased mock test series, practice tests, and performance history.
          </p>
        </div>
        <Link href="/test-series">
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-border">
            <ShoppingBag className="h-3.5 w-3.5" />
            Explore More Series
          </Button>
        </Link>
      </div>

      {enrolledSeries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card">
          <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">No enrolled test series</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            You have not enrolled in any test series yet. Browse our marketplace to get started.
          </p>
          <Link href="/test-series" className="inline-block mt-4">
            <Button size="sm" className="text-xs font-semibold">
              Browse Marketplace
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledSeries.map((series: any) => (
            <Card key={series.id} className="overflow-hidden border-border flex flex-col justify-between">
              <div>
                <div className="h-36 w-full bg-muted relative">
                  <img
                    src={series.thumbnail || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"}
                    alt={series.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-background/90 text-foreground text-[10px] font-semibold">
                      {series.examName}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="p-5 pb-2">
                  <CardTitle className="text-base font-bold line-clamp-1">
                    {series.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {series.shortDescription || series.description}
                  </CardDescription>
                </CardHeader>
              </div>

              <div className="p-5 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">
                  {series.totalTestsCount ?? 0} Mocks Available
                </span>
                <Link href={`/student/tests?seriesId=${series.id}`}>
                  <Button size="sm" className="h-8 text-xs font-semibold gap-1">
                    <BookOpenCheck className="h-3.5 w-3.5" />
                    Open Tests
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
