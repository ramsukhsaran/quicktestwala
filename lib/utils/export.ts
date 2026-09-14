/**
 * Utility functions for exporting tabular and analytical data to CSV and JSON formats in the browser.
 */

export function exportToJson(filename: string, data: any) {
  if (typeof window === "undefined") return;
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  triggerDownload(filename.endsWith(".json") ? filename : `${filename}.json`, blob);
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  if (typeof window === "undefined") return;

  const escapeCell = (cell: any): string => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const csvLines: string[] = [];
  // Add Header
  csvLines.push(headers.map(escapeCell).join(","));

  // Add Data Rows
  for (const row of rows) {
    csvLines.push(row.map(escapeCell).join(","));
  }

  const csvContent = "\uFEFF" + csvLines.join("\r\n"); // UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(filename.endsWith(".csv") ? filename : `${filename}.csv`, blob);
}

function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
