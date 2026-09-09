"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { registerAction } from "@/actions/auth";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result.error) {
      setErrorMsg(result.error);
      setLoading(false);
      return;
    }

    toast({
      title: "Account Created",
      description: "Welcome to ExamForge!",
      type: "success",
    });

    router.push(result.redirectTo || "/student/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo showBadge />
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1 text-center p-6 pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">Create an Account</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Begin your competitive exam practice with ExamForge
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-0 space-y-4">
            {errorMsg && (
              <div className="p-3 text-xs rounded-lg border border-destructive/20 bg-destructive/10 text-destructive">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Aman Sharma"
                  required
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="targetExam">Target Exam</Label>
                <select
                  id="targetExam"
                  name="targetExam"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="SSC CGL 2026">SSC CGL 2026</option>
                  <option value="IBPS PO 2026">IBPS PO / SBI PO</option>
                  <option value="RRB NTPC 2026">RRB NTPC</option>
                  <option value="UPSC Civil Services">UPSC Civil Services</option>
                  <option value="State PSC">State PSC</option>
                  <option value="Defence Exams">CDS / NDA / AFCAT</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  required
                  autoComplete="new-password"
                  className="h-10 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 text-sm font-semibold mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="p-6 pt-0 border-t border-border flex justify-center text-xs text-muted-foreground">
            <span>Already registered?&nbsp;</span>
            <Link href="/login" className="font-semibold text-foreground hover:underline">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
