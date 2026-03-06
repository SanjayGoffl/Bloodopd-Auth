import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";

interface InventoryItem {
  blood_group: string;
  product_type: string;
  available: number;
  reserved: number;
  expiring_48h: number;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const PRODUCTS = ["PRC", "FFP", "PLT", "CRYO", "WB"];

function cellColor(val: number): string {
  if (val === 0) return "bg-gray-50 text-gray-400";
  if (val <= 2) return "bg-danger-50 text-danger-700 font-bold";
  if (val <= 5) return "bg-amber-50 text-amber-700";
  return "bg-medical-50 text-medical-700";
}

export default function InventoryPage() {
  const { data: items, loading } = useApi<InventoryItem[]>("/data/inventory");
  const [view, setView] = useState<"matrix" | "list">("matrix");

  // Build lookup: blood_group -> product_type -> item
  const lookup = new Map<string, Map<string, InventoryItem>>();
  items?.forEach((item) => {
    if (!lookup.has(item.blood_group)) lookup.set(item.blood_group, new Map());
    lookup.get(item.blood_group)!.set(item.product_type, item);
  });

  return (
    <div>
      <PageHeader
        title="Blood Inventory"
        subtitle="Current stock levels by blood group and product type"
        actions={
          <div className="flex rounded-md border overflow-hidden">
            <button
              onClick={() => setView("matrix")}
              className={`px-3 py-1.5 text-xs ${view === "matrix" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              Matrix
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-xs ${view === "list" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              List
            </button>
          </div>
        }
      />

      {loading ? (
        <p className="text-sm text-gray-400">Loading inventory...</p>
      ) : view === "matrix" ? (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Group</th>
                  {PRODUCTS.map((p) => (
                    <th key={p} className="px-4 py-3 text-center">{p}</th>
                  ))}
                  <th className="px-4 py-3 text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {BLOOD_GROUPS.map((bg) => {
                  const row = lookup.get(bg);
                  const total = PRODUCTS.reduce(
                    (sum, p) => sum + (row?.get(p)?.available ?? 0),
                    0
                  );
                  return (
                    <tr key={bg} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="inline-flex h-8 w-10 items-center justify-center rounded bg-danger-50 text-xs font-bold text-danger-700">
                          {bg}
                        </span>
                      </td>
                      {PRODUCTS.map((p) => {
                        const val = row?.get(p)?.available ?? 0;
                        return (
                          <td key={p} className="px-4 py-3 text-center">
                            <span className={`inline-flex h-8 w-10 items-center justify-center rounded text-xs ${cellColor(val)}`}>
                              {val}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center font-semibold">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Blood Group</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-center">Available</th>
                  <th className="px-4 py-3 text-center">Reserved</th>
                  <th className="px-4 py-3 text-center">Expiring &le;48h</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items?.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-bold text-danger-700">{item.blood_group}</td>
                    <td className="px-4 py-2 font-mono text-xs">{item.product_type}</td>
                    <td className={`px-4 py-2 text-center ${cellColor(item.available)}`}>{item.available}</td>
                    <td className="px-4 py-2 text-center">{item.reserved}</td>
                    <td className="px-4 py-2 text-center">
                      {item.expiring_48h > 0 ? (
                        <span className="text-amber-600 font-medium">{item.expiring_48h}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
