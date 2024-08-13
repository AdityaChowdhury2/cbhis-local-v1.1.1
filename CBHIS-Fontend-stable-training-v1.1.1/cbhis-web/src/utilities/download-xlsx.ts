import * as XLSX from "xlsx";

export const downloadXLSX = (data, filename: string) => {
  // Create a new workbook
  const wb = XLSX?.utils?.book_new();
  const fileExtension = ".xlsx";

  // Convert data to worksheet
  const ws = XLSX?.utils.json_to_sheet(data);

  // Add the worksheet to the workbook
  XLSX?.utils.book_append_sheet(wb, ws, "Sheet1");

  // Convert the workbook to a binary XLSX file
  const wbout = XLSX?.write(wb, { type: "binary", bookType: "xlsx" });

  // Convert the binary XLSX data to a Blob
  const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });

  // Download the Blob as a file
  saveAs(blob, filename + fileExtension);
};

// Utility function to convert s to an array buffer
const s2ab = (s) => {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
};

// Utility function to save Blob as a file
const saveAs = (blob, filename) => {
  const link = document.createElement("a");
  link.href = window?.URL?.createObjectURL(blob);
  link.download = filename;
  link?.click();
};
