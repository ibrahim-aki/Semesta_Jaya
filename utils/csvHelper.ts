/**
 * Sanitizes a single cell for CSV output.
 * If the cell contains a semicolon, a double quote, or a newline, it will be enclosed in double quotes.
 * Existing double quotes within the cell will be escaped by doubling them.
 * @param cellData The data for the cell.
 * @returns A CSV-safe string representation of the cell.
 */
const sanitizeCell = (cellData: any): string => {
  const cell = cellData === null || cellData === undefined ? '' : String(cellData);
  if (/[";\n]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
};

/**
 * Creates and triggers a download for a CSV file from an array of headers and data rows.
 * This function handles proper cell sanitization and uses a semicolon delimiter for better Excel compatibility.
 * It also includes a BOM (Byte Order Mark) to ensure UTF-8 characters are read correctly by Excel.
 * @param filename The desired filename for the download (e.g., "report.csv").
 * @param headers An array of strings representing the table headers.
 * @param dataRows A 2D array where each inner array represents a row of data.
 */
export const downloadCsv = (filename: string, headers: string[], dataRows: (string | number | null | undefined)[][]): void => {
  const headerRow = headers.map(sanitizeCell).join(';');
  const contentRows = dataRows.map(row => row.map(sanitizeCell).join(';'));
  
  // BOM for UTF-8 compatibility in Excel
  const bom = "\uFEFF";
  const csvContent = bom + [headerRow, ...contentRows].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
