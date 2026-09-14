import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { PricingPageClient } from "@/components/pricing-page-client";

export default async function PricingPage() {
  const session = await getSession();

  return <PricingPageClient isLoggedIn={Boolean(session)} />;
}
