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
} from "lucide-react";
import Link from "next/link";

const SAMPLE_CSV = `question,option_a,option_b,option_c,option_d,correct_answer,explanation,subject,topic,difficulty,marks,negative_marks
"In a code language, if CAT is 24, what is DOG?","26","27","28","29","A","D(4) + O(15) + G(7) = 26","General Intelligence & Reasoning","Coding & Decoding","EASY",2.0,0.5
"Find the value of x if 3x + 12 = 45.","9","10","11","12","C","3x = 45 - 12 = 33 => x = 11","Quantitative Aptitude","Algebra","EASY",2.0,0.5
"Who was the first Governor-General of independent India?","Lord Mountbatten","C. Rajagopalachari","Dr. Rajendra Prasad","Lord Wavell","A","Lord Mountbatten served as the first Governor-General from 1947 to 1948.","General Awareness","Modern Indian History","MEDIUM",2.0,0.5
"Select the correct synonym for 'ABUNDANT'.","Scarce","Plentiful","Meager","Deficient","B","Abundant means existing or available in large quantities; plentiful.","English Comprehension","Vocabulary","EASY",2.0,0.5`;

export function BulkImportForm() {
  const [csvText, setCsvText] = React.useState(SAMPLE_CSV);
  const [parsedRows, setParsedRows] = React.useState<any[]>([]);
  const [validationErrors, setValidationErrors] = React.useState<{ row: number; error: string }[]>([]);
  const [validRows, setValidRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();
  const { toast } = useToast();

  // Simple CSV line parser supporting quoted cells
  const parseCSV = (text: string) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Match comma separation respecting quotes
      const values: string[] = [];
      let inQuotes = false;
      let currentVal = "";

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(currentVal.trim().replace(/^"|"$/g, ""));
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim().replace(/^"|"$/g, ""));

      const rowObj: Record<string, any> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || "";
      });
      rows.push(rowObj);
    }
    return rows;
  };

  // Validate whenever CSV text changes
  React.useEffect(() => {
    try {
      const rows = parseCSV(csvText);
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
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "examforge_questions_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportValid = async () => {
    if (validRows.length === 0) {
      toast({ title: "No valid rows", description: "All rows failed validation.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      const res = await bulkImportQuestionsAction(validRows);

      if (res.error) {
        toast({ title: "Error", description: res.error, type: "error" });
        setLoading(false);
        return;
      }

      toast({
        title: "Import Completed",
        description: `Successfully inserted ${res.importedCount} questions into Question Bank!`,
        type: "success",
      });

      router.push("/admin/questions");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, type: "error" });
      setLoading(false);
    }
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
              Upload hundreds of verified questions via CSV format with real-time schema validation.
            </p>
          </div>
        </div>

        <Button
          onClick={handleDownloadTemplate}
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 border-border"
        >
          <Download className="h-3.5 w-3.5" />
          Download Sample CSV
        </Button>
      </div>

      {/* Upload Zone & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input & Dropzone */}
        <Card className="lg:col-span-1 border-border p-6 space-y-4">
          <CardTitle className="text-sm font-bold">1. Select CSV File</CardTitle>

          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center hover:bg-muted/40 transition-colors">
            <FileSpreadsheet className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">Upload CSV spreadsheet</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">UTF-8 encoded CSV</p>
            <label className="inline-block mt-3">
              <Button size="sm" variant="outline" className="h-7 text-xs pointer-events-none">
                Browse File
              </Button>
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
              onChange={(e) => setCsvText(e.target.value)}
              rows={8}
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
                  <th className="p-2.5">Subject</th>
                  <th className="p-2.5">Key</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {parsedRows.map((r, i) => {
                  const isErr = validationErrors.some((e) => e.row === i + 1);
                  return (
                    <tr key={i} className="hover:bg-muted/10">
                      <td className="p-2.5 font-mono">{i + 1}</td>
                      <td className="p-2.5 max-w-xs truncate">{r.question}</td>
                      <td className="p-2.5 whitespace-nowrap">{r.subject}</td>
                      <td className="p-2.5 font-mono font-bold">{r.correct_answer}</td>
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
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Only valid questions will be imported into the Question Bank.
            </span>

            <Button
              onClick={handleImportValid}
              disabled={loading || validRows.length === 0}
              className="h-9 px-5 text-xs font-semibold gap-1.5 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Importing...
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
