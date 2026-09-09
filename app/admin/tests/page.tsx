import Link from "next/link";
import { getAllTests } from "@/lib/data/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Timer, Layers, Eye, PencilLine } from "lucide-react";
import { formatDuration } from "@/lib/utils";

export default async function AdminTestsPage() {
  const tests = await getAllTests();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mock Tests Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure test duration, passing marks, negative marking calibrations, and question sets.
          </p>
        </div>
        <Link href="/admin/tests/create">
          <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 shadow-sm">
            <Plus className="h-3.5 w-3.5" />
            Create Mock Test
          </Button>
        </Link>
      </div>

      <Card className="border-border">
        {/* Desktop Table View */}
        <CardContent className="p-0 overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase font-semibold">
                <th className="py-3.5 px-6">Test Title</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Marks & Penalty</th>
                <th className="py-3.5 px-4">Questions</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tests.map((test) => (
                <tr key={test.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-4 px-6 font-semibold text-foreground">
                    {test.title}
                  </td>
                  <td className="py-4 px-4 font-mono">
                    {formatDuration(test.durationMinutes)}
                  </td>
                  <td className="py-4 px-4 font-mono">
                    <span className="font-bold text-foreground">{test.totalMarks} Marks</span>
                    <span className="text-rose-600 dark:text-rose-400 block text-[11px]">
                      -{test.negativeMarkingRate} penalty
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono font-medium">
                    {(("questionIds" in test ? test.questionIds : test.testQuestions?.length) || 0)} Items
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="success" className="text-[10px]">
                      {test.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/tests/${test.id}/questions`}>
                        <Button variant="secondary" size="sm" className="h-7 text-xs gap-1 font-semibold">
                          <Layers className="h-3 w-3" />
                          Manage Questions
                        </Button>
                      </Link>
                      <Link href={`/admin/tests/${test.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                          <PencilLine className="h-3 w-3" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/student/tests/${test.id}/instructions`} target="_blank">
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                          <Eye className="h-3 w-3" />
                          Preview CBT
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-border">
          {tests.map((test) => (
            <div key={test.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{test.title}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {formatDuration(test.durationMinutes)}
                    </span>
                    <span>•</span>
                    <span className="font-mono">
                      {(("questionIds" in test ? test.questionIds : test.testQuestions?.length) || 0)} Items
                    </span>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px] shrink-0">
                  {test.status}
                </Badge>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Total Marks</span>
                  <span className="font-bold text-foreground">{test.totalMarks} Marks</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Marking Ratio</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{test.marksPerQuestion}</span>
                  <span className="text-rose-600 dark:text-rose-400 ml-1">(-{test.negativeMarkingRate})</span>
                </div>
              </div>

              {/* Mobile Actions Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <Link href={`/admin/tests/${test.id}/questions`} className="col-span-3 sm:col-span-1">
                  <Button size="sm" className="w-full h-8 text-xs font-semibold gap-1.5 shadow-sm">
                    <Layers className="h-3.5 w-3.5" />
                    Manage Questions
                  </Button>
                </Link>
                <Link href={`/admin/tests/${test.id}/edit`} className="col-span-1">
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1">
                    <PencilLine className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
                <Link href={`/student/tests/${test.id}/instructions`} target="_blank" className="col-span-2">
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1 text-muted-foreground hover:text-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    Preview CBT
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
