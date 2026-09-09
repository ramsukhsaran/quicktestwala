import { PaymentProvider } from "./types";
import { RazorpayPaymentProvider } from "./razorpay";
import { MockPaymentProvider } from "./mock";

export function getPaymentProvider(): PaymentProvider {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const isConfigured =
    keyId &&
    keySecret &&
    !keyId.includes("placeholder") &&
    !keySecret.includes("placeholder");

  if (isConfigured) {
    return new RazorpayPaymentProvider(keyId, keySecret);
  }

  return new MockPaymentProvider();
}

export * from "./types";
