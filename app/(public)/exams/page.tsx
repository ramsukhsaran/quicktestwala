import Link from "next/link";
import { getCategories } from "@/lib/data/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Clock, Award, Shield } from "lucide-react";

export default async function ExamsPage() {
  const categories = await getCategories();

  const examDetails = [
    {
      name: "SSC CGL (Combined Graduate Level)",
      category: "SSC",
      slug: "ssc-cgl",
      stages: "Tier-1 (CBT) + Tier-2 (CBT)",
      eligibility: "Bachelor's Degree",
      frequency: "Annual",
      sections: "Reasoning, GA, Quantitative Aptitude, English",
      description: "Recruitment to Group B and Group C posts in various Ministries and Departments of the Government of India.",
    },
    {
      name: "RRB NTPC (Non-Technical Popular Categories)",
      category: "Railways",
      slug: "rrb-ntpc",
      stages: "CBT-1 + CBT-2 + Typing/CBAT",
      eligibility: "12th / Graduate",
      frequency: "Regular",
      sections: "General Awareness, Mathematics, General Intelligence",
      description: "Recruitment for Station Master, Goods Guard, Commercial Apprentice, and Traffic Assistant in Indian Railways.",
    },
    {
      name: "UPSC Civil Services Examination",
      category: "UPSC",
      slug: "upsc",
      stages: "Prelims (GS+CSAT) + Mains (Written) + Personality Test",
      eligibility: "Graduate Degree",
      frequency: "Annual",
      sections: "History, Polity, Economy, Geography, Environment, CSAT",
      description: "India's premier competitive examination for IAS, IPS, IFS, and Central Group A Services.",
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-16">
      <div className="max-w-3xl mb-12">
        <Badge variant="outline" className="mb-2 uppercase tracking-widest text-[10px]">
          Official Patterns & Notifications
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Government Competitive Examinations
        </h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Comprehensive guide to examination stages, eligibility requirements, marking schemes, and syllabus patterns for major recruitment bodies in India.
        </p>
      </div>

      <div className="space-y-6">
        {examDetails.map((exam) => (
          <div
            key={exam.name}
            className="p-6 rounded-xl border border-border bg-card hover:border-foreground/20 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <Badge variant="outline" className="text-[10px] font-mono mb-1">
                  {exam.category}
                </Badge>
                <h2 className="text-lg font-bold text-foreground">{exam.name}</h2>
              </div>
              <Link href={`/exams/${exam.slug}`}>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                  View Details
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {exam.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/60 text-xs">
              <div>
                <span className="text-muted-foreground block">Stages:</span>
                <span className="font-medium text-foreground">{exam.stages}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Eligibility:</span>
                <span className="font-medium text-foreground">{exam.eligibility}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Frequency:</span>
                <span className="font-medium text-foreground">{exam.frequency}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Core Sections:</span>
                <span className="font-medium text-foreground">{exam.sections}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
