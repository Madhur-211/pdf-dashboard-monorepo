"use client";

import { useState } from "react";
import { LineItem } from "@/types/invoice";

type InvoiceFormProps = {
  initialData: {
    invoiceNumber?: string;
    date?: string;
    vendor?: string;
    totalAmount?: number;
    items?: LineItem[];
  };
  onSave?: (data: {
    invoiceNumber: string;
    date: string;
    vendor: string;
    totalAmount: number;
    items: LineItem[];
  }) => void;
};

export default function InvoiceForm({ initialData, onSave }: InvoiceFormProps) {
  const [invoiceNumber, setInvoiceNumber] = useState(
    initialData.invoiceNumber || ""
  );
  const [date, setDate] = useState(initialData.date || "");
  const [vendor, setVendor] = useState(initialData.vendor || "");
  const [items, setItems] = useState<LineItem[]>(initialData.items || []);

  function handleItemChange(
    index: number,
    field: keyof LineItem,
    value: string | number
  ) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value } as LineItem;
    setItems(updated);
  }

  function addItem() {
    setItems([
      ...items,
      { description: "", quantity: 1, unitPrice: 0, total: 0 },
    ]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function calculateTotal() {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  function handleSubmit() {
    const data = {
      invoiceNumber,
      date,
      vendor,
      items,
      totalAmount: calculateTotal(),
    };
    onSave?.(data);
  }

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div>
        <label className="block text-sm font-medium">Invoice Number</label>
        <input
          type="text"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Vendor</label>
        <input
          type="text"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Line Items */}
      <div>
        <h3 className="font-semibold mb-2">Line Items</h3>
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-5 gap-2 mb-2 items-center">
            <input
              type="text"
              placeholder="Description"
              value={item.description}
              onChange={(e) =>
                handleItemChange(index, "description", e.target.value)
              }
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(index, "quantity", Number(e.target.value))
              }
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Unit Price"
              value={item.unitPrice}
              onChange={(e) =>
                handleItemChange(index, "unitPrice", Number(e.target.value))
              }
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Total"
              value={item.total}
              readOnly
              className="border p-2 rounded bg-gray-100"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ➕ Add Item
        </button>
      </div>

      {/* Totals */}
      <div className="font-bold">Total: ${calculateTotal().toFixed(2)}</div>

      {/* Save */}
      <button
        type="button"
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Save Invoice
      </button>
    </div>
  );
}
