"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createCheckoutOrderAction, verifyPaymentAction } from "@/actions/checkout";
import { Loader2, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CheckoutButtonProps {
  testSeriesId: string;
  price: number;
  isPurchased: boolean;
  isLoggedIn: boolean;
}

export function CheckoutButton({
  testSeriesId,
  price,
  isPurchased,
  isLoggedIn,
}: CheckoutButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  if (isPurchased) {
    return (
      <Button
        onClick={() => router.push("/student/test-series")}
        className="w-full h-11 text-sm font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <CheckCircle2 className="h-4 w-4" />
        Already Enrolled • Go to Tests
      </Button>
    );
  }

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/test-series`);
      return;
    }

    try {
      setLoading(true);
      const res = await createCheckoutOrderAction(testSeriesId);

      if (res.error) {
        toast({
          title: "Notice",
          description: res.error,
          type: "info",
        });
        if (res.alreadyPurchased) {
          router.push("/student/test-series");
        }
        setLoading(false);
        return;
      }

      if (res.isFree) {
        toast({
          title: "Enrollment Successful",
          description: "You have free access to this test series!",
          type: "success",
        });
        router.push(res.redirectTo || "/student/test-series");
        return;
      }

      // If Razorpay keys are configured and Razorpay script is present:
      if (res.provider === "RAZORPAY" && typeof window !== "undefined" && (window as any).Razorpay) {
        const options = {
          key: res.keyId,
          amount: res.amount * 100,
          currency: res.currency,
          name: "ExamForge",
          description: "Test Series Purchase",
          order_id: res.paymentOrderId,
          handler: async function (response: any) {
            const verifyRes = await verifyPaymentAction({
              orderId: res.orderId!,
              providerPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              toast({
                title: "Payment Successful",
                description: "Test series has been added to your dashboard!",
                type: "success",
              });
              router.push("/student/test-series");
            } else {
              toast({
                title: "Payment Failed",
                description: verifyRes.error || "Signature verification failed",
                type: "error",
              });
            }
          },
          theme: { color: "#000000" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setLoading(false);
        return;
      }

      // Sandbox Mock Provider mode (instant development verification)
      const verifyRes = await verifyPaymentAction({
        orderId: res.orderId!,
        providerPaymentId: `sandbox_${Date.now()}`,
      });

      if (verifyRes.success) {
        toast({
          title: "Enrollment Verified",
          description: "Payment confirmed (Sandbox Mode). Test series activated!",
          type: "success",
        });
        router.push("/student/test-series");
      } else {
        toast({
          title: "Payment Verification Issue",
          description: verifyRes.error,
          type: "error",
        });
      }
    } catch (err: any) {
      toast({
        title: "Checkout Error",
        description: err.message || "Failed to process payment checkout",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full h-11 text-sm font-semibold gap-2 shadow-md"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing Checkout...
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" />
          Enroll Now ({formatCurrency(price)})
        </>
      )}
    </Button>
  );
}
