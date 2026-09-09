import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Cpu, Database, HeartHandshake } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-16 md:py-24 space-y-12">
      <div className="space-y-4">
        <Badge variant="outline" className="uppercase tracking-widest text-[10px]">
          Engineering & Mission
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          About ExamForge
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          ExamForge was built by competitive exam toppers and software engineers who were frustrated with slow, clunky, ad-cluttered coaching portals. We created a developer-grade platform with the fastest CBT test engine in the country.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <div className="p-6 rounded-xl border border-border bg-card space-y-3">
          <Cpu className="h-6 w-6 text-foreground" />
          <h3 className="font-bold text-base">TCS iON Faithful Engine</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Our computer-based test interface mimics the official question palette, countdown timer, marking scheme, and auto-submit behavior of actual exam terminals.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card space-y-3">
          <Database className="h-6 w-6 text-foreground" />
          <h3 className="font-bold text-base">Neon Serverless Reliability</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Powered by Neon PostgreSQL with connection pooling, Drizzle & Prisma ORM, and edge sessions to guarantee zero downtime during peak exam attempt hours.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card space-y-3">
          <ShieldCheck className="h-6 w-6 text-foreground" />
          <h3 className="font-bold text-base">Verified Content Quality</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every question undergoes multi-tier peer verification to ensure zero typographical errors, correct official answer keys, and lucid step-by-step solutions.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card space-y-3">
          <HeartHandshake className="h-6 w-6 text-foreground" />
          <h3 className="font-bold text-base">Aspirant-First Philosophy</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No pop-up advertisements, no unsolicited phone calls, and no high-pressure sales tactics. Just clean, developer-quality mock testing.
          </p>
        </div>
      </div>
    </div>
  );
}
