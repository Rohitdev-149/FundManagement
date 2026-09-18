import Papa from "papaparse";
import { formatDate } from "./format";

export const exportContributionsCsv = (contributions, eventName) => {
  const rows = contributions.map((c) => ({
    Name: c.contributorId?.name || "",
    Amount: c.amount,
    Mode: c.paymentMode,
    Date: formatDate(c.date),
    Status: c.status,
    Note: c.note || "",
  }));
  const csv = Papa.unparse(rows);
  downloadFile(csv, `${eventName}-contributions.csv`, "text/csv");
};

export const exportExpensesCsv = (expenses, eventName) => {
  const rows = expenses.map((e) => ({
    Name: e.name,
    Category: e.categoryId?.name || "",
    Amount: e.amount,
    Vendor: e.vendor || "",
    Mode: e.paymentMode,
    Date: formatDate(e.date),
  }));
  const csv = Papa.unparse(rows);
  downloadFile(csv, `${eventName}-expenses.csv`, "text/csv");
};

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
