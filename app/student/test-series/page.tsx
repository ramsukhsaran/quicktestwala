import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { getUserOrders, getTestSeriesList, getStudentProMembership } from "@/lib/data/store";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, BookOpenCheck, ShoppingBag, Gift, Sparkles, Crown, ArrowRight, ShieldCheck } from "lucide-react";

export default async function StudentTestSeriesPage() {
  const session = await requireAuth();
  const [orders, allPublishedSeries, proMembership] = await Promise.all([
    getUserOrders(session.id),
    getTestSeriesList(),
    getStudentProMembership(session.id),
  ]);

  const hasPro = Boolean(proMembership);
  const paidOrders = orders.filter((o) => o.status === "PAID");

  // Filter out any internal membership dummy items from series list
  const realPublishedSeries = allPublishedSeries.filter(
    (s) => s.id !== "pro_access_all_series" && s.slug !== "pro-full-access" && s.slug !== "pro-access-membership-system"
  );

  const accessibleSeriesList: any[] = [];
  const addedIds = new Set<string>();

  if (hasPro) {
    // 1. If student has 1-year Pro Membership, ALL platform test series are unlocked!
    realPublishedSeries.forEach((series) => {
      addedIds.add(series.id);
      accessibleSeriesList.push({
        ...series,
        accessType: "PRO_UNLOCKED",
      });
    });
  } else {
    // 2. Otherwise, student has access to:
    // a. Single series specifically purchased
    paidOrders.forEach((o) => {
      if (
        o.testSeries &&
        o.testSeries.id !== "pro_access_all_series" &&
        o.testSeries.slug !== "pro-full-access" &&
        !addedIds.has(o.testSeries.id)
      ) {
        addedIds.add(o.testSeries.id);
        accessibleSeriesList.push({
          ...o.testSeries,
          accessType: "PURCHASED",
        });
      }
    });

    // b. Free practice series
    realPublishedSeries.forEach((series) => {
      const isFree = Number(series.price) === 0 || Number(series.discountPrice) === 0;
      if (isFree && !addedIds.has(series.id)) {
        addedIds.add(series.id);
        accessibleSeriesList.push({
          ...series,
          accessType: "FREE",
        });
      }
    });
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Test Series</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Access your free practice series, enrolled test packages, and Pro membership mocks.
          </p>
        </div>
        <Link href="/test-series">
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-border">
            <ShoppingBag className="h-3.5 w-3.5" />
            Explore More Series
          </Button>
        </Link>
      </div>

      {/* Pro Membership Banner */}
      {hasPro && proMembership ? (
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-slate-900 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-600 text-white font-bold text-xs gap-1.5 px-2.5 py-0.5">
                  <Crown className="h-3.5 w-3.5" /> QuickTestWala Pro Active
                </Badge>
                <span className="text-xs text-purple-200 font-mono">1-Year All-Inclusive Membership</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                All Test Series on QuickTestWala are Unlocked
              </h2>
              <p className="text-xs text-purple-200/80 max-w-2xl leading-relaxed">
                As an active Pro Member, you have unlimited 365-day access to every mock test, sectional test, and previous year question paper across all exam categories.
              </p>
            </div>

            <div className="text-left sm:text-right text-xs font-mono text-purple-200 shrink-0 p-3 rounded-xl bg-purple-950/60 border border-purple-500/20">
              <span className="text-purple-400 block text-[10px] uppercase font-semibold">Membership Validity</span>
              <span className="font-bold text-white text-sm">
                {proMembership.accessExpiresAt
                  ? `Valid till ${new Date(proMembership.accessExpiresAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}`
                  : "1 Year Full Access"}
              </span>
              <div className="flex items-center sm:justify-end gap-1 mt-1 text-[11px] text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Unrestricted Access
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-50 via-white to-indigo-50 dark:from-purple-950/30 dark:via-background dark:to-indigo-950/30 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-purple-600 border-purple-500/40 text-[10px] font-bold gap-1">
                  <Sparkles className="h-3 w-3" /> Pro Access Membership
                </Badge>
              </div>
              <h3 className="text-base font-bold text-foreground">
                Want Unlimited Access to All Exam Test Series?
              </h3>
              <p className="text-xs text-muted-foreground max-w-xl">
                Upgrade to the 1-Year QuickTestWala Pro Membership for ₹999 to instantly unlock every current and future test series, full-length CBT mocks, and authentic PYQs.
              </p>
            </div>
            <Link href="/pricing?plan=pro" className="shrink-0">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold gap-1.5 shadow-sm">
                <Crown className="h-3.5 w-3.5" />
                Get Pro Access (1 Year)
              </Button>
            </Link>
          </div>
        </div>
      )}

      {accessibleSeriesList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card">
          <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">No test series enrolled yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            Browse our catalog to enroll in free mock tests, or purchase test series packages or Pro membership.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Link href="/test-series">
              <Button size="sm" className="text-xs font-semibold">
                Browse Catalog
              </Button>
            </Link>
            <Link href="/pricing?plan=pro">
              <Button size="sm" variant="outline" className="text-xs font-semibold gap-1 border-purple-500/30 text-purple-600">
                <Crown className="h-3.5 w-3.5" />
                View Pro Membership
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleSeriesList.map((series: any) => {
            const isProUnlocked = series.accessType === "PRO_UNLOCKED";
            const isFreeAccess = series.accessType === "FREE";

            return (
              <Card key={series.id} className="overflow-hidden border-border flex flex-col justify-between hover:border-foreground/25 transition-all shadow-sm group">
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-muted/40 dark:bg-muted/20 border-b border-border/40 flex items-center justify-center p-4">
                    {/* Ambient blurred backdrop to fit any aspect ratio naturally */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                      <img
                        src={series.thumbnail || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover opacity-15 blur-xl scale-125 dark:opacity-20"
                      />
                      <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px]" />
                    </div>

                    {/* Sharp, uncropped, non-distorted main image */}
                    <img
                      src={series.thumbnail || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"}
                      alt={series.title}
                      loading="lazy"
                      className="relative z-10 max-h-32 max-w-[85%] w-auto h-auto object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    />

                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 flex-wrap">
                      <Badge className="bg-background/90 backdrop-blur-md text-foreground text-[10px] font-semibold border border-border/50 shadow-sm">
                        {series.examName}
                      </Badge>
                      {isProUnlocked ? (
                        <Badge className="bg-purple-600 text-white text-[10px] font-bold gap-1 shadow-sm">
                          <Crown className="h-2.5 w-2.5" /> Pro Unlocked
                        </Badge>
                      ) : isFreeAccess ? (
                        <Badge className="bg-emerald-600 text-white text-[10px] font-bold gap-1 shadow-sm">
                          <Gift className="h-2.5 w-2.5" /> Free Access
                        </Badge>
                      ) : (
                        <Badge className="bg-purple-600 text-white text-[10px] font-bold gap-1 shadow-sm">
                          <Sparkles className="h-2.5 w-2.5" /> Enrolled
                        </Badge>
                      )}
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
                    {series.totalTestsCount ?? series.tests?.length ?? 0} Mocks Available
                  </span>
                  <Link href={`/student/tests?seriesId=${series.id}`}>
                    <Button size="sm" className="h-8 text-xs font-semibold gap-1">
                      <BookOpenCheck className="h-3.5 w-3.5" />
                      Open Tests
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
