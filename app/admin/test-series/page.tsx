import Link from "next/link";
import { getTestSeriesList, getCategories } from "@/lib/data/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Eye, Star, Layers } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function AdminTestSeriesPage() {
  const list = await getTestSeriesList();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Test Series Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create, publish, price, and attach mock tests to competitive exam packages.
          </p>
        </div>
        <Link href="/admin/test-series/create">
          <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 shadow-sm">
            <Plus className="h-3.5 w-3.5" />
            Create Test Series
          </Button>
        </Link>
      </div>

      <Card className="border-border">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase font-semibold">
                <th className="py-3.5 px-6">Title & Exam</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Tests Included</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((ts) => (
                <tr key={ts.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-foreground">{ts.title}</div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {ts.examName} • {ts.language}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {ts.difficulty}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 font-mono font-medium">
                    {ts.totalTestsCount} Mocks
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-foreground">
                    {formatCurrency(ts.discountPrice || ts.price)}
                    {ts.discountPrice && ts.discountPrice < ts.price && (
                      <span className="text-muted-foreground line-through text-[10px] block font-normal">
                        {formatCurrency(ts.price)}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="success" className="text-[10px] font-semibold">
                      {ts.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 font-mono">
                    ★ {ts.rating.toFixed(1)} ({ts.ratingCount})
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/test-series/${ts.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/admin/tests?seriesId=${ts.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                          <Layers className="h-3 w-3" />
                          Manage Tests
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
