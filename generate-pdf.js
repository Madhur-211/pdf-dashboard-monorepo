// generate-pdf.js
const fs = require("fs");
const PDFDocument = require("pdfkit");

function createInvoicePDF(outputPath) {
  const doc = new PDFDocument();

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Title
  doc.fontSize(20).text("Invoice", { align: "center" });
  doc.moveDown();

  // Vendor & details
  doc.fontSize(12).text("Vendor: Acme Supplies Inc.");
  doc.text("Invoice Number: INV-2025-001");
  doc.text("Date: 14-Sep-2025");
  doc.moveDown();

  // Items
  doc.text("Items:");
  doc.text("1. Laptop - Qty: 2 - Price: $1200");
  doc.text("2. Mouse - Qty: 5 - Price: $25");
  doc.moveDown();

  // Total
  doc.text("Total Amount: $2475", { align: "right" });

  doc.end();

  stream.on("finish", () => {
    console.log(`✅ PDF generated at ${outputPath}`);
  });
}

createInvoicePDF("invoice-test.pdf");
