import { requireAuth } from "@/lib/auth/session";
import { getUserById } from "@/lib/data/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, Mail, Phone, GraduationCap } from "lucide-react";

export default async function StudentProfilePage() {
  const session = await requireAuth();
  const user = await getUserById(session.id);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Profile & Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your personal information, exam vertical preferences, and security.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-base font-bold">Account Information</CardTitle>
          <CardDescription className="text-xs">
            Personal identity and test credentials registered on ExamForge.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input defaultValue={user?.name || session.name} readOnly className="h-10 text-sm bg-muted/20" />
            </div>

            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input defaultValue={user?.email || session.email} readOnly className="h-10 text-sm bg-muted/20" />
            </div>

            <div className="space-y-1.5">
              <Label>Target Examination</Label>
              <Input defaultValue={user?.profile?.targetExam || "SSC CGL 2026"} className="h-10 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label>Contact Phone</Label>
              <Input defaultValue={user?.profile?.phone || "+91 91234 56789"} className="h-10 text-sm" />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button size="sm" className="text-xs font-semibold">
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
