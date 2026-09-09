"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { loginAction, demoLoginAction } from "@/actions/auth";
import { Loader2, Shield, GraduationCap, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const [demoLoading, setDemoLoading] = React.useState<"ADMIN" | "STUDENT" | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const redirectPath = searchParams.get("redirect");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result.error) {
      setErrorMsg(result.error);
      setLoading(false);
      return;
    }

    toast({
      title: "Welcome Back",
      description: "Signed in successfully.",
      type: "success",
    });

    router.push(redirectPath || result.redirectTo || "/student/dashboard");
  };

  const handleDemoLogin = async (role: "ADMIN" | "STUDENT") => {
    setErrorMsg(null);
    setDemoLoading(role);

    const result = await demoLoginAction(role);

    if (result.error) {
      setErrorMsg(result.error);
      setDemoLoading(null);
      return;
    }

    toast({
      title: `Demo ${role === "ADMIN" ? "Admin" : "Student"} Signed In`,
      description: "Access granted.",
      type: "success",
    });

    router.push(redirectPath || result.redirectTo || (role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard"));
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo showBadge />
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1 text-center p-6 pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">Sign In to ExamForge</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your credentials to access your mock tests and analytics
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-10 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || demoLoading !== null}
                className="w-full h-10 text-sm font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-mono">
                  Instant Demo Access
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin("STUDENT")}
                disabled={demoLoading !== null || loading}
                className="h-10 text-xs font-semibold gap-1.5 border-border hover:bg-muted"
              >
                {demoLoading === "STUDENT" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <GraduationCap className="h-4 w-4" />
                )}
                Demo Student
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin("ADMIN")}
                disabled={demoLoading !== null || loading}
                className="h-10 text-xs font-semibold gap-1.5 border-border hover:bg-muted"
              >
                {demoLoading === "ADMIN" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
                Demo Admin
              </Button>
            </div>
          </CardContent>

          <CardFooter className="p-6 pt-0 border-t border-border flex justify-center text-xs text-muted-foreground">
            <span>Don&apos;t have an account?&nbsp;</span>
            <Link href="/register" className="font-semibold text-foreground hover:underline">
              Create an account
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
