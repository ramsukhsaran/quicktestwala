"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createCheckoutOrderAction, verifyPaymentAction } from "@/actions/checkout";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PaymentModal, type PaymentOrderData } from "@/components/checkout/payment-modal";

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
  const [modalOpen, setModalOpen] = React.useState(false);
  const [orderData, setOrderData] = React.useState<PaymentOrderData | null>(null);

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

      // If Razorpay live provider is active and script is ready:
      if (
        res.provider === "RAZORPAY" &&
        typeof window !== "undefined" &&
        (window as any).Razorpay
      ) {
        const options = {
          key: res.keyId,
          amount: res.amount * 100,
          currency: res.currency,
          name: "QuickTestWala",
          description: res.seriesTitle || "Test Series Purchase",
          order_id: res.paymentOrderId,
          handler: async function (response: any) {
            setLoading(true);
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
                title: "Payment Verification Failed",
                description: verifyRes.error || "Signature verification failed",
                type: "error",
              });
              setLoading(false);
            }
          },
          prefill: {
            name: res.user?.name,
            email: res.user?.email,
          },
          theme: { color: "#059669" },
        };

        try {
          const rzp = new (window as any).Razorpay(options);
          rzp.on("payment.failed", function (response: any) {
            toast({
              title: "Payment Failed",
              description: response.error?.description || "Transaction declined",
              type: "error",
            });
            setLoading(false);
          });
          rzp.open();
          setLoading(false);
          return;
        } catch {
          // Fallback to simulator if SDK throws or is blocked
        }
      }

      // Interactive Sandbox Mock Modal
      setOrderData({
        orderId: res.orderId!,
        orderNumber: res.orderNumber || `ORD-${res.orderId?.slice(-6).toUpperCase()}`,
        paymentOrderId: res.paymentOrderId!,
        amount: res.amount!,
        currency: res.currency || "INR",
        seriesTitle: res.seriesTitle || "Test Series",
        examName: res.examName,
        user: res.user,
      });
      setModalOpen(true);
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
    <>
      <Button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full h-11 text-sm font-semibold gap-2 shadow-md"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Initializing Payment...
          </>
        ) : price === 0 ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Enroll for Free
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Enroll Now ({formatCurrency(price)})
          </>
        )}
      </Button>

      <PaymentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        orderData={orderData}
        onSuccess={() => {
          setModalOpen(false);
          toast({
            title: "Enrollment Verified",
            description: "Payment confirmed (Sandbox Mode). Test series activated!",
            type: "success",
          });
          router.push("/student/test-series");
        }}
      />
    </>
  );
}
