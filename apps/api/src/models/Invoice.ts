import mongoose, { Schema, Document } from "mongoose";

interface LineItem {
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface InvoiceDoc extends Document {
  fileId: string;
  fileName: string;
  vendor: { name: string; address?: string; taxId?: string };
  invoice: {
    number: string;
    date: string;
    currency?: string;
    subtotal?: number;
    taxPercent?: number;
    total?: number;
    poNumber?: string;
    poDate?: string;
    lineItems: LineItem[];
  };
  createdAt: Date;
  updatedAt?: Date;
}

const InvoiceSchema = new Schema<InvoiceDoc>(
  {
    fileId: { type: String, required: true },
    fileName: { type: String, required: true },
    vendor: {
      name: { type: String, required: true },
      address: String,
      taxId: String,
    },
    invoice: {
      number: { type: String, required: true },
      date: { type: String, required: true },
      currency: String,
      subtotal: Number,
      taxPercent: Number,
      total: Number,
      poNumber: String,
      poDate: String,
      lineItems: [
        {
          description: String,
          unitPrice: Number,
          quantity: Number,
          total: Number,
        },
      ],
    },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model<InvoiceDoc>("Invoice", InvoiceSchema);
