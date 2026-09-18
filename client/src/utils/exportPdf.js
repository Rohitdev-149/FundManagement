import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "./format";

export const exportFinancialSummaryPdf = (
  eventName,
  dashboard,
  contributions,
  expenses,
) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`${eventName} - Financial Report`, 14, 15);

  doc.setFontSize(11);
  doc.text(
    `Total Collection: ${formatCurrency(dashboard.totalCollection)}`,
    14,
    25,
  );
  doc.text(
    `Total Expense: ${formatCurrency(dashboard.totalExpense)}`,
    14,
    32,
  );
  doc.text(`Balance: ${formatCurrency(dashboard.balance)}`, 14, 39);

  autoTable(doc, {
    startY: 48,
    head: [["Contributor", "Amount", "Mode", "Date"]],
    body: contributions.map((c) => [
      c.contributorId?.name || "",
      formatCurrency(c.amount),
      c.paymentMode,
      formatDate(c.date),
    ]),
    theme: "striped",
    headStyles: { fillColor: [249, 115, 22] },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Expense", "Category", "Amount", "Date"]],
    body: expenses.map((e) => [
      e.name,
      e.categoryId?.name || "",
      formatCurrency(e.amount),
      formatDate(e.date),
    ]),
    theme: "striped",
    headStyles: { fillColor: [239, 68, 68] },
  });

  doc.save(`${eventName}-financial-report.pdf`);
};
