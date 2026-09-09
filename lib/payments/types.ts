export interface CreatePaymentOrderInput {
  orderNumber: string;
  amount: number; // in INR
  currency: string;
  notes?: Record<string, string>;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

export interface PaymentOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  provider: "RAZORPAY" | "MOCK";
  keyId?: string;
  meta?: Record<string, unknown>;
}

export interface VerifyPaymentInput {
  orderId: string;
  providerPaymentId: string;
  signature?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  orderId: string;
  providerPaymentId: string;
  message?: string;
}

export interface PaymentProvider {
  name: "RAZORPAY" | "MOCK";
  createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult>;
}
