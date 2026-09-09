import { getAllStudents } from "@/lib/data/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentStatusToggle } from "@/components/admin/student-status-toggle";
import { Users, GraduationCap, Shield } from "lucide-react";

export default async function AdminStudentsPage() {
  const students = await getAllStudents();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Registered aspirants, examination attempts, enrolled packages, and account status controls.
        </p>
      </div>

      <Card className="border-border">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase font-semibold">
                <th className="py-3.5 px-6">Student</th>
                <th className="py-3.5 px-4">Target Exam</th>
                <th className="py-3.5 px-4">Purchased Series</th>
                <th className="py-3.5 px-4">Tests Attempted</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((st: any) => (
                <tr key={st.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-foreground">{st.name}</div>
                    <div className="text-[11px] text-muted-foreground">{st.email}</div>
                  </td>
                  <td className="py-4 px-4 font-medium">
                    {st.profile?.targetExam || st.targetExam || "SSC CGL 2026"}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold">
                    {st.orders?.length || 1} Series
                  </td>
                  <td className="py-4 px-4 font-mono">
                    {st.attempts?.length || 2} Mocks Taken
                  </td>
                  <td className="py-4 px-4">
                    {st.status === "ACTIVE" ? (
                      <Badge variant="success" className="text-[10px] font-semibold">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[10px] font-semibold">
                        Blocked
                      </Badge>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <StudentStatusToggle userId={st.id} currentStatus={st.status} />
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
