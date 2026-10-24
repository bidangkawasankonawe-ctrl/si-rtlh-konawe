/** Parser CSV sederhana (mendukung delimiter koma/semicolon, kutip ganda, CRLF). */

function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function parseCsv(text: string): Record<string, string>[] {
  if (!text) return [];
  // buang BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const firstLine = text.split(/\r?\n/)[0] ?? "";
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  const delim = semicolons > commas ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = false;
      } else cur += c;
    } else if (c === '"') {
      inQ = true;
    } else if (c === delim) {
      row.push(cur);
      cur = "";
    } else if (c === "\n") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else if (c !== "\r") {
      cur += c;
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }

  const clean = rows.filter((r) => r.some((v) => v.trim() !== ""));
  if (clean.length < 2) return [];
  const header = clean[0].map(normalizeHeader);

  return clean.slice(1).map((r) => {
    const o: Record<string, string> = {};
    header.forEach((h, idx) => {
      if (h) o[h] = (r[idx] ?? "").trim();
    });
    return o;
  });
}
