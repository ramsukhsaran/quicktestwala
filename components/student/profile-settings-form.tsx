"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { updateStudentProfileAction, changeStudentPasswordAction } from "@/actions/profile";
import { useAppDispatch } from "@/lib/store/hooks";
import { updateProfile } from "@/lib/store/slices/authSlice";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  GraduationCap,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

interface ProfileSettingsFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt?: Date | string;
    profile?: {
      phone?: string | null;
      targetExam?: string | null;
      state?: string | null;
      education?: string | null;
    } | null;
  };
}

const COMMON_EXAMS = [
  "SSC CGL 2026",
  "SSC CHSL 2026",
  "RRB NTPC (Railways)",
  "IBPS PO / Clerk",
  "UPSC Civil Services",
  "State PSC / Police",
];

const COMMON_STATES = [
  "Delhi NCR",
  "Uttar Pradesh",
  "Bihar",
  "Rajasthan",
  "Madhya Pradesh",
  "Maharashtra",
  "West Bengal",
  "Haryana",
  "Punjab",
  "Karnataka",
  "Tamil Nadu",
];

const EDUCATION_LEVELS = [
  "Graduate (B.A. / B.Sc. / B.Tech / B.Com)",
  "Post Graduate (M.A. / M.Sc. / M.Tech / MBA)",
  "Undergraduate (Currently Pursuing Degree)",
  "12th Pass / Intermediate (Higher Secondary)",
  "Diploma / Vocational Certificate",
];

export function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  // Profile Form State
  const [name, setName] = React.useState(user.name || "");
  const [phone, setPhone] = React.useState(user.profile?.phone || "");
  const [targetExam, setTargetExam] = React.useState(user.profile?.targetExam || "SSC CGL 2026");
  const [state, setState] = React.useState(user.profile?.state || "Delhi NCR");
  const [education, setEducation] = React.useState(
    user.profile?.education || "Graduate (B.A. / B.Sc. / B.Tech / B.Com)"
  );

  const [isProfilePending, setIsProfilePending] = React.useState(false);
  const [profileMessage, setProfileMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [isPasswordPending, setIsPasswordPending] = React.useState(false);
  const [passwordMessage, setPasswordMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Handle Profile Save
  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProfilePending(true);
    setProfileMessage(null);

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("phone", phone);
      formData.set("targetExam", targetExam);
      formData.set("state", state);
      formData.set("education", education);

      const res = await updateStudentProfileAction(formData);

      if (!res.success) {
        setProfileMessage({ type: "error", text: res.error || "Failed to update profile." });
        toast({
          title: "Update Failed",
          description: res.error || "Could not save profile changes.",
          type: "error",
        });
      } else {
        setProfileMessage({ type: "success", text: res.message || "Profile preferences saved!" });
        toast({
          title: "Profile Saved",
          description: "Your personal details and exam preferences were updated.",
          type: "success",
        });

        // Sync Redux state
        dispatch(
          updateProfile({
            name: name.trim(),
          })
        );

        // Refresh Next.js server context so header/sidebar initials update
        router.refresh();
      }
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Unexpected error occurred." });
      toast({
        title: "Error",
        description: err.message || "Something went wrong.",
        type: "error",
      });
    } finally {
      setIsProfilePending(false);
    }
  };

  // Handle Password Save
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPasswordPending(false);
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setIsPasswordPending(true);

    try {
      const formData = new FormData();
      formData.set("currentPassword", currentPassword);
      formData.set("newPassword", newPassword);
      formData.set("confirmPassword", confirmPassword);

      const res = await changeStudentPasswordAction(formData);

      if (!res.success) {
        setPasswordMessage({ type: "error", text: res.error || "Failed to update password." });
        toast({
          title: "Password Error",
          description: res.error || "Current password was incorrect.",
          type: "error",
        });
      } else {
        setPasswordMessage({ type: "success", text: res.message || "Password updated successfully!" });
        toast({
          title: "Password Updated",
          description: "Your account credentials have been changed securely.",
          type: "success",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Unexpected error occurred." });
      toast({
        title: "Error",
        description: err.message || "Failed to update password.",
        type: "error",
      });
    } finally {
      setIsPasswordPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md h-11 p-1 bg-muted/60 border border-border">
          <TabsTrigger value="profile" className="text-xs font-semibold gap-1.5">
            <User className="h-3.5 w-3.5" />
            Profile & Target
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs font-semibold gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="account" className="text-xs font-semibold gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Account Info
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Profile & Exam Preferences */}
        <TabsContent value="profile" className="mt-4">
          <Card className="border-border">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Personal & Examination Preferences</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Update your identity, target vertical, and educational qualifications.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Synced With DB
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-0">
              {profileMessage && (
                <div
                  className={`mb-5 p-3 rounded-lg flex items-center gap-2.5 text-xs font-medium ${
                    profileMessage.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {profileMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold">
                      Full Name <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aman Sharma"
                        required
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>

                  {/* Email (Read-Only) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email" className="text-xs font-semibold">
                        Registered Email Address
                      </Label>
                      <span className="text-[10px] text-muted-foreground">Primary Login</span>
                    </div>
                    <div className="relative">
                      <Input
                        id="email"
                        value={user.email}
                        readOnly
                        disabled
                        className="h-10 text-sm bg-muted/40 cursor-not-allowed font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Contact Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">
                      Contact Phone
                    </Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        name="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>

                  {/* Target Examination */}
                  <div className="space-y-1.5">
                    <Label htmlFor="targetExam" className="text-xs font-semibold">
                      Target Examination
                    </Label>
                    <Input
                      id="targetExam"
                      name="targetExam"
                      value={targetExam}
                      onChange={(e) => setTargetExam(e.target.value)}
                      placeholder="e.g. SSC CGL 2026"
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                {/* Quick Selection Tags for Exam */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Quick Select Exam Target:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_EXAMS.map((exam) => (
                      <button
                        type="button"
                        key={exam}
                        onClick={() => setTargetExam(exam)}
                        className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                          targetExam === exam
                            ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                            : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                        }`}
                      >
                        {exam}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* State / UT of Domicile */}
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-xs font-semibold">
                      State / UT of Domicile
                    </Label>
                    <div className="relative">
                      <Input
                        id="state"
                        name="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Delhi NCR, Uttar Pradesh"
                        list="states-list"
                        className="h-10 text-sm"
                      />
                      <datalist id="states-list">
                        {COMMON_STATES.map((st) => (
                          <option key={st} value={st} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Education Qualification */}
                  <div className="space-y-1.5">
                    <Label htmlFor="education" className="text-xs font-semibold">
                      Highest Education Qualification
                    </Label>
                    <div className="relative">
                      <Input
                        id="education"
                        name="education"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="e.g. Graduate"
                        list="education-list"
                        className="h-10 text-sm"
                      />
                      <datalist id="education-list">
                        {EDUCATION_LEVELS.map((ed) => (
                          <option key={ed} value={ed} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border">
                  <p className="text-[11px] text-muted-foreground">
                    All updates are instantly saved to your student profile database.
                  </p>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isProfilePending}
                    className="text-xs font-semibold min-w-[130px]"
                  >
                    {isProfilePending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Security & Password */}
        <TabsContent value="security" className="mt-4">
          <Card className="border-border">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-base font-bold">Account Security & Credentials</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Protect your QuickTestWala account with an updated, secure password.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-0">
              {passwordMessage && (
                <div
                  className={`mb-5 p-3 rounded-lg flex items-center gap-2.5 text-xs font-medium ${
                    passwordMessage.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {passwordMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-xs font-semibold">
                    Current Password <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="h-10 text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-semibold">
                    New Password <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="h-10 text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Must contain at least 6 characters. Use letters, numbers, and symbols.
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    required
                    minLength={6}
                    className="h-10 text-sm"
                  />
                </div>

                <div className="pt-3">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPasswordPending}
                    className="text-xs font-semibold min-w-[130px]"
                  >
                    {isPasswordPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Account Overview & Metadata */}
        <TabsContent value="account" className="mt-4">
          <Card className="border-border">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-base font-bold">System Credentials & Account Metadata</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                System identifiers and platform status registered on QuickTestWala.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Account Identifier (User ID)
                  </span>
                  <p className="text-xs font-mono font-semibold break-all">{user.id}</p>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Role & Permissions
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-mono">
                      {user.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Standard Aspirant</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Account Status
                  </span>
                  <div>
                    <Badge
                      variant={user.status === "ACTIVE" ? "success" : "destructive"}
                      className="text-xs font-mono"
                    >
                      {user.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Session Encryption
                  </span>
                  <p className="text-xs font-semibold">Jose JWT HS256 (7-Day Active)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
