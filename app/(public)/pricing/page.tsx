import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Single Series Pass",
      price: "₹299",
      period: "per test series",
      description: "Ideal for aspirants targeting a specific exam like SSC CGL or IBPS PO.",
      features: [
        "Full access to selected test series",
        "25+ Full-length CBT mock tests",
        "Step-by-step mathematical explanations",
        "All-India Percentile & Accuracy metrics",
        "12 Months Validity",
        "Mobile & Desktop access",
      ],
      cta: "Explore Test Series",
      href: "/test-series",
      highlight: false,
    },
    {
      name: "All-Access Annual Pass",
      price: "₹899",
      period: "per year",
      description: "Best for aspirants preparing for multiple examinations (SSC + Banking + Railways).",
      features: [
        "Unlimited access to ALL test series",
        "100+ CBT Mock Tests across 8 categories",
        "Sectional drills & Speed improvement tests",
        "Priority customer & doubt support",
        "Previous year solved papers (2018-2025)",
        "Early access to newly released mock sets",
      ],
      cta: "Get Annual Pass",
      href: "/register",
      highlight: true,
    },
    {
      name: "Institutional / Group Pass",
      price: "₹2,499",
      period: "5 student licenses",
      description: "Engineered for study groups and small coaching batches.",
      features: [
        "5 Independent Student Accounts",
        "Shared comparative score leaderboards",
        "Batch analytics for mentors",
        "Bulk question performance exports",
        "Dedicated account manager",
      ],
      cta: "Contact Team",
      href: "/about",
      highlight: false,
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <Badge variant="outline" className="mb-2 uppercase tracking-widest text-[10px]">
          Transparent Pricing
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Invest in High-Yield Preparation
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
          No hidden fees, no recurring auto-debits. Simple one-time passes designed for government exam aspirants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <div className="pt-4 flex items-baseline gap-1">
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
              <Link href={plan.href} className="w-full">
                <Button
                  className="w-full h-10 text-xs font-semibold"
                  variant={plan.highlight ? "default" : "outline"}
                >
                  {plan.cta}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
