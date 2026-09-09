import type {
  PaymentProvider,
  CreatePaymentOrderInput,
  PaymentOrderResult,
  VerifyPaymentInput,
  PaymentVerificationResult,
} from "./types";

export class MockPaymentProvider implements PaymentProvider {
  name = "MOCK" as const;

  async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    const mockOrderId = `mock_ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      orderId: mockOrderId,
      amount: input.amount,
      currency: input.currency || "INR",
      provider: "MOCK",
      meta: {
        description: "ExamForge Sandbox Test Payment",
      },
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    return {
      success: true,
      orderId: input.orderId,
      providerPaymentId: input.providerPaymentId || `mock_pay_${Date.now()}`,
      message: "Sandbox payment verified successfully",
    };
  }
}
