import crypto from "crypto";
import type {
  PaymentProvider,
  CreatePaymentOrderInput,
  PaymentOrderResult,
  VerifyPaymentInput,
  PaymentVerificationResult,
} from "./types";

export class RazorpayPaymentProvider implements PaymentProvider {
  name = "RAZORPAY" as const;
  private keyId: string;
  private keySecret: string;

  constructor(keyId: string, keySecret: string) {
    this.keyId = keyId;
    this.keySecret = keySecret;
  }

  async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    const authHeader = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
    
    // Razorpay requires amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(input.amount * 100);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: input.currency || "INR",
        receipt: input.orderNumber,
        notes: input.notes,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Razorpay Order Creation Failed: ${JSON.stringify(err)}`);
    }

    const data = await response.json();

    return {
      orderId: data.id,
      amount: input.amount,
      currency: data.currency,
      provider: "RAZORPAY",
      keyId: this.keyId,
      meta: data,
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    if (!input.signature) {
      return {
        success: false,
        orderId: input.orderId,
        providerPaymentId: input.providerPaymentId,
        message: "Missing signature for Razorpay payment verification",
      };
    }

    const expectedSignature = crypto
      .createHmac("sha256", this.keySecret)
      .update(`${input.orderId}|${input.providerPaymentId}`)
      .digest("hex");

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(input.signature)
    );

    if (isMatch) {
      return {
        success: true,
        orderId: input.orderId,
        providerPaymentId: input.providerPaymentId,
      };
    }

    return {
      success: false,
      orderId: input.orderId,
      providerPaymentId: input.providerPaymentId,
      message: "Signature mismatch: Payment could not be validated",
    };
  }
}
