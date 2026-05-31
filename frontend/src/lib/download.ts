export function downloadTextFile(filename: string, content: string, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob(["\uFEFF", content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function escapeCsvCell(value: string | number): string {
  const text = String(value);
  if (/[",;\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function rowsToCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(";")).join("\r\n");
}

export function openPrintReport(title: string, bodyHtml: string) {
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) {
    throw new Error("POPUP_BLOCKED");
  }

  win.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Marianne, Arial, sans-serif; color: #161616; margin: 2rem; font-size: 11pt; }
    h1 { font-size: 16pt; margin: 0 0 0.25rem; }
    h2 { font-size: 13pt; margin: 1.5rem 0 0.5rem; page-break-after: avoid; }
    h3 { font-size: 11pt; margin: 1rem 0 0.35rem; page-break-after: avoid; }
    .meta { color: #666; font-size: 10pt; margin-bottom: 1.5rem; }
    table { width: 100%; border-collapse: collapse; margin: 0.5rem 0 1rem; font-size: 10pt; }
    th, td { border: 1px solid #ccc; padding: 0.35rem 0.5rem; text-align: left; }
    th { background: #f6f6f6; }
    .footer { margin-top: 2rem; font-size: 9pt; color: #666; }
    @media print { body { margin: 1cm; } }
  </style>
</head>
<body>
  ${bodyHtml}
  <p class="footer">Lulu Santé — CHUM Pilotage APRS — généré le ${new Date().toLocaleString("fr-CA")}</p>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`);
  win.document.close();
}
