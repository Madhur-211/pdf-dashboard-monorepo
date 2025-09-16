"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Invoice = {
  _id: string;
  vendor?: { name: string };
  invoice?: { number: string; date: string; total: number };
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchInvoices(q?: string) {
    setLoading(true);
    try {
      const res = await api.get("/invoices", { params: q ? { q } : {} });
      setInvoices(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch invoices", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await api.delete(`/invoices/${id}`);
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      console.error("❌ Delete failed", err);
    }
  }

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search by vendor or invoice number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => fetchInvoices(search)}>Search</Button>
        <Button variant="outline" onClick={() => fetchInvoices()}>
          Reset
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading…</p>
      ) : invoices.length === 0 ? (
        <p className="text-gray-500">No invoices found</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv._id}>
                <TableCell>{inv.vendor?.name || "-"}</TableCell>
                <TableCell>{inv.invoice?.number || "-"}</TableCell>
                <TableCell>{inv.invoice?.date || "-"}</TableCell>
                <TableCell>
                  {inv.invoice?.total
                    ? `$${Number(inv.invoice.total).toFixed(2)}`
                    : "-"}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      (window.location.href = `/invoices/${inv._id}`)
                    }
                  >
                    View
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(inv._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
