import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo showBadge />
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1 text-center p-6 pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">Reset Password</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your account email to receive a password reset link
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-0 space-y-4">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                className="h-10 text-sm"
              />
            </div>

            <Button className="w-full h-10 text-sm font-semibold">
              Send Reset Link
            </Button>
          </CardContent>

          <CardFooter className="p-6 pt-0 border-t border-border flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
