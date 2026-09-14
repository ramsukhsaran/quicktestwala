"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { bulkImportQuestionsAction } from "@/actions/admin";
import { csvQuestionImportSchema } from "@/lib/validations/test";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

import { parseCsvRFC4180 } from "@/lib/utils/csv";
import { extractQuestionFigureUrl } from "@/lib/utils/figure";
import { Image as ImageIcon, Info, HelpCircle } from "lucide-react";

const SAMPLE_CSV = `question,option_a,option_b,option_c,option_d,correct_answer,explanation,subject,topic,difficulty,marks,negative_marks,image_url
"In the given right-angled triangle ABC, if AB = 3 cm and BC = 4 cm, find the length of hypotenuse AC.","4 cm","5 cm","6 cm","7 cm","B","AC = √(3² + 4²) = √25 = 5 cm.","Quantitative Aptitude","Geometry","EASY",2.0,0.5,"https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80"
"Study the pattern in the figure and identify which option completes the sequence.","Pattern A","Pattern B","Pattern C","Pattern D","C","Each step rotates 90 degrees clockwise.","General Intelligence & Reasoning","Non-Verbal Reasoning","MEDIUM",2.0,0.5,"https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80"
"Find the value of x if 3x + 12 = 45.","9","10","11","12","C","3x = 45 - 12 = 33 => x = 11","Quantitative Aptitude","Algebra","EASY",2.0,0.5,""
"Who was the first Governor-General of independent India?","Lord Mountbatten","C. Rajagopalachari","Dr. Rajendra Prasad","Lord Wavell","A","Lord Mountbatten served as the first Governor-General from 1947 to 1948.","General Awareness","Modern Indian History","MEDIUM",2.0,0.5,""
"Select the correct synonym for 'ABUNDANT'.","Scarce","Plentiful","Meager","Deficient","B","Abundant means existing or available in large quantities; plentiful.","English Comprehension","Vocabulary","EASY",2.0,0.5,""`;

export function BulkImportForm() {
  const [csvText, setCsvText] = React.useState(SAMPLE_CSV);
  const [parsedRows, setParsedRows] = React.useState<any[]>([]);
  const [validationErrors, setValidationErrors] = React.useState<{ row: number; error: string }[]>([]);
  const [validRows, setValidRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [importResult, setImportResult] = React.useState<{
    success: boolean;
    importedCount?: number;
    errors?: any[];
  } | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  // Validate whenever CSV text changes
  React.useEffect(() => {
    try {
      const rows = parseCsvRFC4180(csvText);
      setParsedRows(rows);

      const errors: { row: number; error: string }[] = [];
      const valids: any[] = [];

      rows.forEach((row, idx) => {
        const res = csvQuestionImportSchema.safeParse(row);
        if (!res.success) {
          errors.push({
            row: idx + 1,
            error: res.error.errors.map((e) => e.message).join("; "),
          });
        } else {
          valids.push(res.data);
        }
      });

      setValidationErrors(errors);
      setValidRows(valids);
    } catch {
      setParsedRows([]);
      setValidRows([]);
      setValidationErrors([{ row: 0, error: "Malformed CSV format" }]);
    }
  }, [csvText]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        setImportResult(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "quicktestwala_questions_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportValid = async () => {
    if (validRows.length === 0) {
      toast({ title: "No valid rows", description: "Please ensure at least one question satisfies validation rules.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      setImportResult(null);

      const res = await bulkImportQuestionsAction(validRows);

      if (res.error) {
        toast({ title: "Import Failed", description: res.error, type: "error" });
        setImportResult({ success: false, errors: res.errors || [res.error] });
        return;
      }

      setImportResult({
        success: true,
        importedCount: res.importedCount,
        errors: res.errors,
      });

      toast({
        title: "Bulk Import Successful!",
        description: `Successfully inserted ${res.importedCount} questions into Question Bank.`,
        type: "success",
      });

      // Refresh data and prepare navigation
      router.refresh();
      setTimeout(() => {
        router.push("/admin/questions");
      }, 1500);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to complete bulk import", type: "error" });
      setImportResult({ success: false, errors: [err.message] });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCsvText(SAMPLE_CSV);
    setImportResult(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/questions">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bulk Question Import</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload verified questions via CSV with atomic database batch insertion.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-border flex-1 sm:flex-none"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Sample
          </Button>
          <Button
            onClick={handleDownloadTemplate}
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-border flex-1 sm:flex-none"
          >
            <Download className="h-3.5 w-3.5" />
            Download Sample CSV
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {importResult?.success && (
        <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                  Import Completed Successfully!
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                  Inserted <strong>{importResult.importedCount}</strong> questions into the master Question Bank in Neon PostgreSQL.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/questions">
                <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 shadow-sm">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View in Question Bank
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Figure / Diagram Question Instructions Guide */}
      <Card className="border-primary/20 bg-primary/5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div className="space-y-2 text-xs text-foreground/90">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">How to Add Figure & Diagram Questions in CSV</span>
              <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30">
                Supported
              </Badge>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              You can attach figures, geometric diagrams, maps, or reasoning flowcharts in your bulk CSV using either of the following methods:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg border border-border/60 bg-card space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-mono">1</span>
                  Method A: Dedicated <code className="bg-muted px-1 rounded text-primary font-mono text-[11px]">image_url</code> Column
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Add a header column named <strong className="text-foreground">image_url</strong> or <strong className="text-foreground">figure_url</strong>. Provide a hosted HTTPS image URL, relative path (<code className="text-[10px]">/images/...</code>), or base64 data URI.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border/60 bg-card space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-mono">2</span>
                  Method B: Inline Markdown in <code className="bg-muted px-1 rounded text-primary font-mono text-[11px]">question</code> Text
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Embed directly inside question text using standard markdown: <code className="bg-muted px-1 rounded text-[10px] select-all font-mono">![Figure](https://example.com/fig.png)</code> or <code className="bg-muted px-1 rounded text-[10px] select-all font-mono">&lt;img src=&quot;...&quot; /&gt;</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Upload Zone & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input & Dropzone */}
        <Card className="lg:col-span-1 border-border p-6 space-y-4">
          <CardTitle className="text-sm font-bold">1. Select CSV File</CardTitle>

          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center hover:bg-muted/40 transition-colors">
            <FileSpreadsheet className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">Upload CSV spreadsheet</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">UTF-8 RFC 4180 standard with Figure support</p>
            <label className="inline-block mt-3 cursor-pointer">
              <span className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-7 px-3">
                Browse File
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-1.5 pt-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Or edit CSV text directly:
            </span>
            <textarea
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setImportResult(null);
              }}
              rows={9}
              className="w-full p-2.5 rounded-md border border-input bg-card font-mono text-[11px] leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </Card>

        {/* Right: Validation Preview */}
        <Card className="lg:col-span-2 border-border p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <CardTitle className="text-sm font-bold">2. Import Validation Preview</CardTitle>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span>Total: <strong>{parsedRows.length}</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400">
                Valid: <strong>{validRows.length}</strong>
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                Invalid: <strong>{validationErrors.length}</strong>
              </span>
            </div>
          </div>

          {/* Validation Errors Notice */}
          {validationErrors.length > 0 && (
            <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20 text-xs space-y-1">
              <span className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                Validation errors found in {validationErrors.length} row(s):
              </span>
              <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[11px] text-muted-foreground">
                {validationErrors.map((err, i) => (
                  <p key={i}>
                    • Row {err.row}: {err.error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Parsed Table Sample */}
          <div className="border border-border rounded-lg overflow-x-auto max-h-[300px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-muted/40 sticky top-0 border-b border-border">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Question</th>
                  <th className="p-2.5">Figure</th>
                  <th className="p-2.5">Subject</th>
                  <th className="p-2.5">Key</th>
                  <th className="p-2.5">Marks</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {parsedRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-muted-foreground">
                      No CSV rows found. Paste CSV content or upload a spreadsheet.
                    </td>
                  </tr>
                ) : (
                  parsedRows.map((r, i) => {
                    const isErr = validationErrors.some((e) => e.row === i + 1);
                    const figureUrl = extractQuestionFigureUrl(r);
                    return (
                      <tr key={i} className="hover:bg-muted/10">
                        <td className="p-2.5 font-mono">{i + 1}</td>
                        <td className="p-2.5 max-w-xs truncate font-medium">
                          {r.question || "—"}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          {figureUrl ? (
                            <a
                              href={figureUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-primary/40 bg-primary/10 text-primary text-[10px] font-mono hover:bg-primary/20"
                              title={figureUrl}
                            >
                              <ImageIcon className="h-3 w-3" />
                              <span>Figure</span>
                            </a>
                          ) : (
                            <span className="text-muted-foreground font-mono text-[11px]">—</span>
                          )}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">{r.subject || "—"}</td>
                        <td className="p-2.5 font-mono font-bold">{r.correct_answer || "—"}</td>
                        <td className="p-2.5 font-mono">+{r.marks || 2} / -{r.negative_marks || 0.5}</td>
                        <td className="p-2.5">
                          {isErr ? (
                            <Badge variant="destructive" className="text-[9px]">
                              Invalid
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-[9px]">
                              Valid
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-muted-foreground text-center sm:text-left">
              {validRows.length} ready to be inserted in an atomic batch.
            </span>

            <Button
              onClick={handleImportValid}
              disabled={loading || validRows.length === 0}
              className="h-9 px-5 text-xs font-semibold gap-1.5 shadow-sm w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Importing ({validRows.length} questions)...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Import {validRows.length} Valid Questions
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
