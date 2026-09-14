import { requireAdmin } from "@/lib/auth/session";
import { getAllStudents } from "@/lib/data/store";
import { AdminStudentsView } from "@/components/admin/admin-students-view";

export default async function AdminStudentsPage() {
  await requireAdmin();
  const students = await getAllStudents();

  return <AdminStudentsView students={students} />;
}
