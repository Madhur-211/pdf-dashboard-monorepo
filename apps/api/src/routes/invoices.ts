import { Router } from "express";
import multer from "multer";
import { Invoice } from "../models/Invoice";
import { extractInvoiceData } from "../services/ai";

const router = Router();
const upload = multer();

// GET /invoices?q=search
router.get("/", async (req, res) => {
  const q = req.query.q as string;
  const filter = q
    ? {
        $or: [
          { "vendor.name": { $regex: q, $options: "i" } },
          { "invoice.number": { $regex: q, $options: "i" } },
        ],
      }
    : {};
  const invoices = await Invoice.find(filter);
  res.json(invoices);
});

// GET /invoices/:id
router.get("/:id", async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ error: "Not found" });
  res.json(invoice);
});

// POST /invoices (manual JSON input)
router.post("/", async (req, res) => {
  const invoice = new Invoice(req.body);
  await invoice.save();
  res.status(201).json(invoice);
});

// apps/api/src/routes/invoices.ts (upload handler)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const model = (req.query.model as "gemini" | "groq") || "groq";
    const extracted = await extractInvoiceData(req.file.buffer, model);
    if (!extracted)
      return res.status(500).json({ error: "AI extraction failed" });

    const invoiceData = {
      fileId: req.file.filename || Date.now().toString(),
      fileName: req.file.originalname,
      createdAt: new Date().toISOString(),
      vendor: {
        name: extracted.vendor?.name || "Unknown Vendor",
        address: extracted.vendor?.address || "",
        taxId: extracted.vendor?.taxId || "",
      },
      invoice: {
        number: extracted.invoice?.number || `INV-${Date.now()}`,
        date: extracted.invoice?.date || new Date().toISOString().slice(0, 10),
        currency: extracted.invoice?.currency || "USD",
        subtotal: extracted.invoice?.subtotal || 0,
        taxPercent: extracted.invoice?.taxPercent || 0,
        total: extracted.invoice?.total || 0,
        poNumber: extracted.invoice?.poNumber || "",
        poDate: extracted.invoice?.poDate || "",
        lineItems: extracted.invoice?.lineItems || [],
      },
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload & process" });
  }
});

// PUT /invoices/:id
router.put("/:id", async (req, res) => {
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(invoice);
});

// DELETE /invoices/:id
router.delete("/:id", async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
