"use server";

import { requireAuth } from "@/lib/auth/session";
import {
  createOrder,
  activateOrder,
  hasUserPurchasedSeries,
  getTestSeriesById,
} from "@/lib/data/store";
import { getPaymentProvider } from "@/lib/payments/provider";

export async function createCheckoutOrderAction(testSeriesId: string) {
  try {
    const user = await requireAuth();

    // Check if already purchased
    const alreadyPurchased = await hasUserPurchasedSeries(user.id, testSeriesId);
    if (alreadyPurchased) {
      return { error: "You already have active access to this test series", alreadyPurchased: true };
    }

    const series = await getTestSeriesById(testSeriesId);
    if (!series) {
      return { error: "Test series not found" };
    }

    const effectivePrice =
      series.discountPrice && series.discountPrice > 0
        ? series.discountPrice
        : series.price;

    // Create order record in database
    const order = await createOrder({
      userId: user.id,
      testSeriesId: series.id,
      amount: effectivePrice,
    });

    // If free (₹0), activate immediately
    if (effectivePrice === 0) {
      await activateOrder(order.id, `free_grant_${Date.now()}`);
      return {
        success: true,
        orderId: order.id,
        isFree: true,
        redirectTo: `/student/test-series`,
      };
    }

    // Call payment provider (Razorpay or Sandbox Mock)
    const provider = getPaymentProvider();
    const paymentOrder = await provider.createOrder({
      orderNumber: order.orderNumber,
      amount: effectivePrice,
      currency: "INR",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      notes: {
        testSeriesTitle: series.title,
        orderId: order.id,
      },
    });

    return {
      success: true,
      orderId: order.id,
      paymentOrderId: paymentOrder.orderId,
      amount: effectivePrice,
      currency: "INR",
      provider: paymentOrder.provider,
      keyId: paymentOrder.keyId,
    };
  } catch (err: any) {
    return { error: err.message || "Failed to initiate payment checkout" };
  }
}

export async function verifyPaymentAction(data: {
  orderId: string;
  providerPaymentId: string;
  signature?: string;
}) {
  try {
    const user = await requireAuth();
    const provider = getPaymentProvider();

    const verification = await provider.verifyPayment({
      orderId: data.orderId,
      providerPaymentId: data.providerPaymentId,
      signature: data.signature,
    });

    if (!verification.success) {
      return { error: verification.message || "Payment verification failed" };
    }

    // Activate the order and grant access
    const updatedOrder = await activateOrder(data.orderId, data.providerPaymentId);

    return {
      success: true,
      order: updatedOrder,
      redirectTo: `/student/test-series`,
    };
  } catch (err: any) {
    return { error: err.message || "Failed to verify and activate payment" };
  }
}
