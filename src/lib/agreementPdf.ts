import { jsPDF } from "jspdf";

export interface AgreementPdfData {
  hostelName: string;
  hostelLocation?: string;
  ownerName: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  monthlyRent: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  terms: string;
  studentSignature?: string | null;
  studentSignedAt?: string | null;
  ownerSignature?: string | null;
  ownerSignedAt?: string | null;
  agreementId: string;
}

const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return d;
  }
};

export function generateAgreementPdf(data: AgreementPdfData): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("RENTAL AGREEMENT", pageW / 2, y, { align: "center" });
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Agreement ID: ${data.agreementId}`, pageW / 2, y, { align: "center" });
  doc.setTextColor(0);
  y += 28;

  doc.setFontSize(10);
  const intro =
    `This Rental Agreement is made on ${fmtDate(new Date().toISOString())} between ` +
    `${data.ownerName} ("Owner") and ${data.studentName} ("Tenant") for accommodation at ` +
    `${data.hostelName}${data.hostelLocation ? ", " + data.hostelLocation : ""}.`;
  const lines = doc.splitTextToSize(intro, pageW - margin * 2);
  doc.text(lines, margin, y);
  y += lines.length * 13 + 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1. Parties", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const parties: [string, string][] = [
    ["Owner", data.ownerName],
    ["Tenant", data.studentName],
    ["Tenant Email", data.studentEmail || "—"],
    ["Tenant Phone", data.studentPhone || "—"],
  ];
  parties.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${k}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(v, margin + 110, y);
    y += 14;
  });
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("2. Property & Term", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const details: [string, string][] = [
    ["Property", data.hostelName],
    ["Address", data.hostelLocation || "—"],
    ["Start Date", fmtDate(data.startDate)],
    ["End Date", fmtDate(data.endDate)],
    ["Monthly Rent", `INR ${data.monthlyRent.toLocaleString("en-IN")}`],
    ["Security Deposit", `INR ${data.securityDeposit.toLocaleString("en-IN")}`],
  ];
  details.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${k}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(v, margin + 110, y);
    y += 14;
  });
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("3. Terms & Conditions", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const termsLines = doc.splitTextToSize(data.terms || "—", pageW - margin * 2);
  termsLines.forEach((ln: string) => {
    if (y > 740) { doc.addPage(); y = margin; }
    doc.text(ln, margin, y);
    y += 13;
  });

  y += 24;
  if (y > 680) { doc.addPage(); y = margin; }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("4. Signatures", margin, y);
  y += 20;

  const colW = (pageW - margin * 2) / 2 - 12;
  // Owner
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("OWNER", margin, y);
  doc.text("TENANT", margin + colW + 24, y);
  y += 18;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(14);
  doc.text(data.ownerSignature || "[ not signed ]", margin, y);
  doc.text(data.studentSignature || "[ not signed ]", margin + colW + 24, y);
  y += 6;

  doc.setDrawColor(180);
  doc.line(margin, y + 4, margin + colW, y + 4);
  doc.line(margin + colW + 24, y + 4, margin + colW * 2 + 24, y + 4);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(data.ownerName, margin, y);
  doc.text(data.studentName, margin + colW + 24, y);
  y += 12;
  doc.text(`Signed: ${fmtDate(data.ownerSignedAt)}`, margin, y);
  doc.text(`Signed: ${fmtDate(data.studentSignedAt)}`, margin + colW + 24, y);
  doc.setTextColor(0);

  // Footer
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `HostelHub Digital Agreement · Page ${i} of ${total}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: "center" }
    );
  }

  return doc;
}

export function downloadAgreementPdf(data: AgreementPdfData) {
  const doc = generateAgreementPdf(data);
  doc.save(`agreement-${data.hostelName.replace(/\s+/g, "_")}-${data.agreementId.slice(0, 8)}.pdf`);
}