/**
 * RFC 4180 Compliant CSV Parser
 * Handles escaped double quotes (""), multi-line fields within quotes,
 * commas within quoted values, varied CRLF/LF line endings, and case-insensitive header normalization.
 */

export function normalizeCsvHeader(h: string): string {
  return h
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/^"|"$/g, "");
}

export function parseCsvToRows(text: string): string[][] {
  if (!text || !text.trim()) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped double quotes: "" -> "
        currentField += '"';
        i += 2;
        continue;
      } else {
        // Toggle quoted field state
        insideQuotes = !insideQuotes;
        i++;
        continue;
      }
    }

    if (!insideQuotes && (char === "\n" || (char === "\r" && nextChar === "\n"))) {
      currentRow.push(currentField.trim());
      currentField = "";
      if (currentRow.length > 0 && currentRow.some((v) => v !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      i += char === "\r" ? 2 : 1;
      continue;
    }

    if (!insideQuotes && char === "\r") {
      currentRow.push(currentField.trim());
      currentField = "";
      if (currentRow.length > 0 && currentRow.some((v) => v !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      i++;
      continue;
    }

    if (!insideQuotes && char === ",") {
      currentRow.push(currentField.trim());
      currentField = "";
      i++;
      continue;
    }

    currentField += char;
    i++;
  }

  // Push trailing field/row if any
  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.length > 0 && currentRow.some((v) => v !== "")) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export function parseCsvRFC4180(text: string): Record<string, string>[] {
  const rows = parseCsvToRows(text);
  if (rows.length < 2) return [];

  const rawHeaders = rows[0];
  const headers = rawHeaders.map(normalizeCsvHeader);
  const result: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const item: Record<string, string> = {};
    let hasData = false;

    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      const val = (row[c] || "").trim().replace(/^"|"$/g, "");
      if (key) {
        item[key] = val;
        if (val) hasData = true;
      }
    }

    if (hasData) {
      result.push(item);
    }
  }

  return result;
}
