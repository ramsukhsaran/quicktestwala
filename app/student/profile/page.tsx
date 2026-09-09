import { requireAuth } from "@/lib/auth/session";
import { getUserById } from "@/lib/data/store";
import { ProfileSettingsForm } from "@/components/student/profile-settings-form";

export default async function StudentProfilePage() {
  const session = await requireAuth();
  const user = await getUserById(session.id);

  const userData = {
    id: user?.id || session.id,
    name: user?.name || session.name,
    email: user?.email || session.email,
    role: user?.role || session.role,
    status: user?.status || session.status,
    createdAt: (user as any)?.createdAt,
    profile: user?.profile || {
      phone: null,
      targetExam: "SSC CGL 2026",
      state: "Delhi NCR",
      education: "Graduate (B.A. / B.Sc. / B.Tech / B.Com)",
    },
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Profile & Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your personal information, exam vertical preferences, and security.
        </p>
      </div>

      <ProfileSettingsForm user={userData} />
    </div>
  );
}

