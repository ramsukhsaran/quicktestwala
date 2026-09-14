"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { createCheckoutOrderAction, verifyPaymentAction } from "@/actions/checkout";
import { PaymentModal, type PaymentOrderData } from "@/components/checkout/payment-modal";

interface PricingPageClientProps {
  isLoggedIn: boolean;
}

export function PricingPageClient({ isLoggedIn }: PricingPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [orderData, setOrderData] = React.useState<PaymentOrderData | null>(null);
  const hasAutoTriggeredRef = React.useRef(false);

  const startProCheckout = React.useCallback(async () => {
    if (!isLoggedIn) {
      router.push("/register?plan=pro");
      return;
    }

    try {
      setLoadingPlan("PRO");
      const res = await createCheckoutOrderAction({ planType: "PRO", amount: 999 });

      if (res.error) {
        if (res.alreadyPurchased) {
          router.push("/student/test-series");
          return;
        }
        toast({ title: "Pro access unavailable", description: res.error, type: "error" });
        router.push("/register?plan=pro");
        return;
      }

      if (res.provider === "RAZORPAY" && typeof window !== "undefined" && (window as any).Razorpay) {
        const options = {
          key: res.keyId,
          amount: res.amount * 100,
          currency: res.currency,
          name: "QuickTestWala",
          description: "Pro Full Access",
          order_id: res.paymentOrderId,
          handler: async function (response: any) {
            const verifyRes = await verifyPaymentAction({
              orderId: res.orderId!,
              providerPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              toast({ title: "Payment successful", description: "Pro Full Access is now active.", type: "success" });
              router.push("/student/test-series");
            } else {
              toast({ title: "Payment verification failed", description: verifyRes.error || "Try again.", type: "error" });
            }
          },
          prefill: { name: res.user?.name, email: res.user?.email },
          theme: { color: "#059669" },
        };

        try {
          const rzp = new (window as any).Razorpay(options);
          rzp.on("payment.failed", function (response: any) {
            toast({
              title: "Payment failed",
              description: response.error?.description || "Transaction declined",
              type: "error",
            });
          });
          rzp.open();
          setLoadingPlan(null);
          return;
        } catch {
          // fall through to sandbox modal
        }
      }

      setOrderData({
        orderId: res.orderId!,
        orderNumber: res.orderNumber || `ORD-${res.orderId?.slice(-6).toUpperCase()}`,
        paymentOrderId: res.paymentOrderId!,
        amount: res.amount!,
        currency: res.currency || "INR",
        seriesTitle: "Pro Full Access",
        examName: "All Test Series",
        user: res.user,
      });
      setModalOpen(true);
    } catch (err: any) {
      toast({ title: "Checkout error", description: err.message || "Failed to begin Pro checkout.", type: "error" });
    } finally {
      setLoadingPlan(null);
    }
  }, [isLoggedIn, router, toast]);

  React.useEffect(() => {
    if (searchParams.get("plan") === "pro" && isLoggedIn && !hasAutoTriggeredRef.current) {
      hasAutoTriggeredRef.current = true;
      startProCheckout();
    }
  }, [searchParams, isLoggedIn, startProCheckout]);

  const plans = [
    {
      name: "Single Series Pass",
      price: "₹299",
      period: "6 months",
      description: "Best when you need access to one exam-specific series, such as SSC CGL or RRB NTPC.",
      features: [
        "Access to one selected test series",
        "Full-length CBT mock tests for that exam",
        "Sectional tests and topic-wise practice",
        "Performance analytics and answer explanations",
        "Valid for 6 months from purchase",
        "Mobile & desktop access",
      ],
      cta: "Explore Test Series",
      href: "/test-series",
      highlight: false,
    },
    {
      name: "Pro Full Access Membership",
      price: "₹999",
      period: "1-year full pass",
      description: "Ideal for serious aspirants who want complete unrestricted access to every exam test series on the platform for 1 full year.",
      features: [
        "Unlimited access to ALL test series on platform",
        "Full CBT mock test library across all major exams",
        "All current and future test series included",
        "All previous year question papers (PYQs) unlocked",
        "1-Year (365 days) membership validity",
        "Step-by-step solutions and verified answer keys",
      ],
      cta: "Get 1-Year Pro Membership",
      href: "/register?plan=pro",
      highlight: true,
    },
  ];

  return (
    <>
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-2 uppercase tracking-widest text-[10px]">
            Flexible Pricing
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Pick the right plan for your prep stage
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
            Choose a focused series pass for one exam or unlock Pro for complete access across all government exams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col justify-between rounded-xl border transition-all ${
                plan.highlight
                  ? "border-foreground shadow-xl ring-1 ring-foreground bg-card"
                  : "border-border shadow-sm bg-card"
              }`}
            >
              <CardHeader className="p-6">
                {plan.highlight && (
                  <div className="mb-2">
                    <Badge className="bg-foreground text-background text-[10px] font-bold uppercase tracking-wider">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">
                  {plan.description}
                </p>
                <div className="pt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-mono text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-3">
                <div className="pt-4 border-t border-border space-y-2.5">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                {plan.highlight ? (
                  <Button onClick={startProCheckout} className="w-full h-10 text-xs font-semibold" variant="default" disabled={loadingPlan === "PRO"}>
                    {loadingPlan === "PRO" ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Link href={plan.href} className="w-full">
                    <Button className="w-full h-10 text-xs font-semibold" variant="outline">
                      {plan.cta}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-border bg-muted/20 p-5 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">Access policy</p>
          <ul className="space-y-2">
            <li>• Test-series purchase grants access to that specific series for 6 months.</li>
            <li>• Pro Full Access grants access to all test series for 1 year.</li>
            <li>• One-time payment only. No recurring monthly subscription is added automatically.</li>
          </ul>
        </div>
      </div>

      <PaymentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        orderData={orderData}
        onSuccess={() => {
          setModalOpen(false);
          toast({ title: "Enrollment Verified", description: "Pro Full Access activated successfully.", type: "success" });
          router.push("/student/test-series");
        }}
      />
    </>
  );
}
