"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Invoice, LineItem } from "@/types/invoice";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
});

export default function Home() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUrl(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await api.post<Invoice>(
        "/invoices/upload?model=groq",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setExtractedData(res.data);
    } catch (err) {
      console.error("❌ Upload failed", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!extractedData?._id) return;
    try {
      await api.put(`/invoices/${extractedData._id}`, extractedData);
      alert("✅ Invoice updated!");
    } catch (err) {
      console.error("❌ Save failed", err);
    }
  }

  async function handleDelete() {
    if (!extractedData?._id) return;
    try {
      await api.delete(`/invoices/${extractedData._id}`);
      setExtractedData(null);
      alert("🗑 Invoice deleted!");
    } catch (err) {
      console.error("❌ Delete failed", err);
    }
  }

  function updateField(path: string, value: string | number) {
    setExtractedData((prev) => {
      if (!prev) return prev;
      const clone: Invoice = JSON.parse(JSON.stringify(prev));

      const keys = path.split(".");
      let obj: Record<string, unknown> = clone as unknown as Record<
        string,
        unknown
      >;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key])
        ) {
          obj = obj[key] as Record<string, unknown>;
        }
      }

      obj[keys[keys.length - 1]] = value;
      return clone;
    });
  }

  function addLineItem() {
    setExtractedData((prev) => {
      if (!prev) return prev;
      const clone: Invoice = JSON.parse(JSON.stringify(prev));
      clone.invoice.lineItems = clone.invoice.lineItems || [];
      clone.invoice.lineItems.push({
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      });
      return clone;
    });
  }

  function removeLineItem(index: number) {
    setExtractedData((prev) => {
      if (!prev) return prev;
      const clone: Invoice = JSON.parse(JSON.stringify(prev));
      clone.invoice.lineItems?.splice(index, 1);
      return clone;
    });
  }

  function updateLineItem(
    index: number,
    field: keyof LineItem,
    value: string | number
  ) {
    setExtractedData((prev) => {
      if (!prev) return prev;
      const clone: Invoice = JSON.parse(JSON.stringify(prev));
      if (!clone.invoice.lineItems) return clone;

      const item = clone.invoice.lineItems[index];
      if (field === "description" && typeof value === "string") {
        item.description = value;
      } else if (field === "quantity" && typeof value === "number") {
        item.quantity = value;
      } else if (field === "unitPrice" && typeof value === "number") {
        item.unitPrice = value;
      } else if (field === "total" && typeof value === "number") {
        item.total = value;
      }

      // auto-calc total for that row
      item.total = item.quantity * item.unitPrice;

      // recalc invoice total
      clone.invoice.total = clone.invoice.lineItems.reduce(
        (sum, i) => sum + (i.total || 0),
        0
      );

      return clone;
    });
  }

  return (
    <div className="grid grid-cols-2 h-screen">
      {/* Left = PDF Viewer */}
      <div className="p-4 border-r overflow-auto">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <PdfViewer fileUrl={fileUrl} />
      </div>

      {/* Right = Editable Invoice Form */}
      <div className="p-4 overflow-auto">
        <h2 className="text-xl font-bold mb-4">Invoice Data</h2>

        {loading && <p>Extracting data…</p>}

        {extractedData ? (
          <form className="space-y-3">
            <div>
              <label>Vendor Name</label>
              <Input
                value={extractedData.vendor?.name || ""}
                onChange={(e) => updateField("vendor.name", e.target.value)}
              />
            </div>
            <div>
              <label>Invoice Number</label>
              <Input
                value={extractedData.invoice?.number || ""}
                onChange={(e) => updateField("invoice.number", e.target.value)}
              />
            </div>
            <div>
              <label>Invoice Date</label>
              <Input
                type="date"
                value={extractedData.invoice?.date || ""}
                onChange={(e) => updateField("invoice.date", e.target.value)}
              />
            </div>
            <div>
              <label>Total</label>
              <Input
                type="number"
                value={extractedData.invoice?.total || 0}
                onChange={(e) =>
                  updateField("invoice.total", Number(e.target.value))
                }
              />
            </div>

            {/* Line Items */}
            <div>
              <h3 className="font-semibold mt-4">Line Items</h3>
              {extractedData.invoice.lineItems?.map((item, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 mt-2">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(index, "description", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItem(index, "quantity", Number(e.target.value))
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Unit Price"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateLineItem(index, "unitPrice", Number(e.target.value))
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Total"
                    value={item.total}
                    readOnly
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeLineItem(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={addLineItem} className="mt-2">
                ➕ Add Item
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button type="button" onClick={handleSave}>
                Save
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-gray-500">Upload a PDF to see extracted data</p>
        )}
      </div>
    </div>
  );
}
