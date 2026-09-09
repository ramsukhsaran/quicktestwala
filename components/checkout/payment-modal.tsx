"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { verifyPaymentAction } from "@/actions/checkout";
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Lock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export interface PaymentOrderData {
  orderId: string;
  orderNumber: string;
  paymentOrderId: string;
  amount: number;
  currency: string;
  seriesTitle: string;
  examName?: string;
  user?: {
    name?: string;
    email?: string;
  };
}

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderData: PaymentOrderData | null;
  onSuccess?: () => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  orderData,
  onSuccess,
}: PaymentModalProps) {
  const [tab, setTab] = React.useState<"upi" | "card" | "netbanking">("upi");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingStep, setProcessingStep] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form states
  const [upiApp, setUpiApp] = React.useState<string>("gpay");
  const [upiId, setUpiId] = React.useState("student@okhdfcbank");
  const [cardNumber, setCardNumber] = React.useState("4000 1234 5678 9010");
  const [cardExpiry, setCardExpiry] = React.useState("12/28");
  const [cardCvv, setCardCvv] = React.useState("888");
  const [cardHolder, setCardHolder] = React.useState(orderData?.user?.name || "Candidate");
  const [selectedBank, setSelectedBank] = React.useState("HDFC");

  React.useEffect(() => {
    if (orderData?.user?.name) {
      setCardHolder(orderData.user.name);
    }
    if (open) {
      setIsProcessing(false);
      setIsSuccess(false);
      setError(null);
    }
  }, [open, orderData]);

  if (!orderData) return null;

  const handleSimulatePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Step 1: Simulated Handshake
      setProcessingStep("Securing 256-bit bank connection...");
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Simulated Authorization
      setProcessingStep(
        tab === "upi"
          ? "Authorizing UPI transaction..."
          : tab === "card"
          ? "Validating card credentials with bank..."
          : `Connecting to ${selectedBank} NetBanking gateway...`
      );
      await new Promise((r) => setTimeout(r, 700));

      // Generate realistic mock payment ID
      const providerPaymentId = `pay_mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // Step 3: Call Server Action to activate order
      setProcessingStep("Finalizing enrollment in database...");
      const verifyRes = await verifyPaymentAction({
        orderId: orderData.orderId,
        providerPaymentId,
      });

      if (!verifyRes.success) {
        throw new Error(verifyRes.error || "Payment verification failed");
      }

      setIsSuccess(true);
      setProcessingStep("Payment Successful!");

      // Wait a moment so user sees success checkmark
      await new Promise((r) => setTimeout(r, 1200));

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Simulated payment failed");
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isProcessing && onOpenChange(val)}>
      <DialogContent className="max-w-md p-0 overflow-hidden border border-border shadow-2xl rounded-2xl bg-card">
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                QTW
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">QuickTestWala™ Payments</h3>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span>Razorpay Gateway Verified</span>
                </div>
              </div>
            </div>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-semibold uppercase tracking-wider">
              Sandbox Test Mode
            </Badge>
          </div>

          {/* Test Series Order Banner */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="max-w-[240px]">
              <p className="text-xs text-slate-400">Purchasing Series</p>
              <p className="text-xs font-semibold text-slate-100 truncate">
                {orderData.seriesTitle}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Order #{orderData.orderNumber}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Payable</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {formatCurrency(orderData.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Sandbox Explainer Callout */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>Sandbox Mode:</strong> Testing with mock Razorpay keys. Select any method below to test payment.
          </span>
        </div>

        {/* Body Content */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-in zoom-in-50">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground">Payment Successful!</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Transaction verified and order activated in PostgreSQL. Redirecting to your dashboard...
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full font-mono">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Redirecting to test series...
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setTab("upi")}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  tab === "upi"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setTab("card")}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  tab === "card"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setTab("netbanking")}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  tab === "netbanking"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>NetBanking</span>
              </button>
            </div>

            {/* Tab 1: UPI */}
            {tab === "upi" && (
              <div className="space-y-3">
                <div className="border border-border rounded-xl p-3.5 bg-muted/30 text-center flex flex-col items-center">
                  {/* Stylized QR Code SVG */}
                  <div className="h-28 w-28 bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                      <rect x="5" y="5" width="30" height="30" fill="currentColor" rx="4" />
                      <rect x="10" y="10" width="20" height="20" fill="white" rx="2" />
                      <rect x="14" y="14" width="12" height="12" fill="currentColor" rx="1" />
                      <rect x="65" y="5" width="30" height="30" fill="currentColor" rx="4" />
                      <rect x="70" y="10" width="20" height="20" fill="white" rx="2" />
                      <rect x="74" y="14" width="12" height="12" fill="currentColor" rx="1" />
                      <rect x="5" y="65" width="30" height="30" fill="currentColor" rx="4" />
                      <rect x="10" y="70" width="20" height="20" fill="white" rx="2" />
                      <rect x="14" y="74" width="12" height="12" fill="currentColor" rx="1" />
                      <rect x="42" y="15" width="8" height="8" fill="currentColor" />
                      <rect x="52" y="25" width="6" height="14" fill="currentColor" />
                      <rect x="42" y="42" width="16" height="16" fill="currentColor" rx="2" />
                      <rect x="65" y="45" width="10" height="8" fill="currentColor" />
                      <rect x="45" y="68" width="10" height="10" fill="currentColor" />
                      <rect x="65" y="68" width="12" height="24" fill="currentColor" />
                      <rect x="80" y="68" width="15" height="10" fill="currentColor" />
                    </svg>
                    <span className="absolute bottom-1 bg-white px-1 text-[8px] font-bold text-slate-800 tracking-wider">
                      UPI QR
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-foreground mt-2">
                    Scan with any UPI app to pay
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Google Pay, PhonePe, Paytm, BHIM, CRED
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Or select 1-Click UPI Test App</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "gpay", label: "GPay", color: "border-blue-500/40 text-blue-600 dark:text-blue-400" },
                      { id: "phonepe", label: "PhonePe", color: "border-purple-500/40 text-purple-600 dark:text-purple-400" },
                      { id: "paytm", label: "Paytm", color: "border-sky-500/40 text-sky-600 dark:text-sky-400" },
                      { id: "bhim", label: "BHIM", color: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400" },
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setUpiApp(app.id)}
                        className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          upiApp === app.id
                            ? `${app.color} bg-muted ring-1 ring-primary`
                            : "border-border text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        {app.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">UPI ID</Label>
                  <Input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="name@upi"
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Cards */}
            {tab === "card" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Card Number</Label>
                  <div className="relative">
                    <Input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="h-8 text-xs font-mono pr-14"
                    />
                    <span className="absolute right-2 top-2 text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      TEST
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Valid Thru</Label>
                    <Input
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">CVV</Label>
                    <Input
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      type="password"
                      maxLength={4}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Cardholder Name</Label>
                  <Input
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Candidate Name"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: NetBanking */}
            {tab === "netbanking" && (
              <div className="space-y-2">
                <Label className="text-xs">Select Bank</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "HDFC", name: "HDFC Bank" },
                    { id: "SBI", name: "State Bank of India" },
                    { id: "ICICI", name: "ICICI Bank" },
                    { id: "AXIS", name: "Axis Bank" },
                    { id: "KOTAK", name: "Kotak Mahindra" },
                    { id: "PNB", name: "Punjab National" },
                  ].map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBank(bank.id)}
                      className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-colors ${
                        selectedBank === bank.id
                          ? "border-primary bg-primary/5 text-primary font-semibold"
                          : "border-border text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <Button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full h-11 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{processingStep || "Processing Payment..."}</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Pay {formatCurrency(orderData.amount)}</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                disabled={isProcessing}
                onClick={() => onOpenChange(false)}
                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel Transaction
              </Button>
            </div>

            {/* Footer Trust Guarantee */}
            <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                256-bit Bank Grade Security
              </span>
              <span>PCI-DSS Level 1 Compliant</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
