import type { ReactNode } from "react";
import { Package } from "lucide-react";
import type { Order } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";

interface OrderCardProps {
  order: Order;
  actions?: ReactNode;
}

export default function OrderCard({ order, actions }: OrderCardProps) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="font-mono text-sm font-semibold text-gray-800">
            {order.id}
          </span>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="mb-3 space-y-1 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span className="font-medium text-gray-700">{order.customerName}</span>
          <span className="text-gray-400">|</span>
          <span>{order.customerPhone}</span>
        </div>
      </div>

      <div className="mb-3 rounded-md bg-gray-50 p-3">
        <ul className="space-y-1">
          {order.items.map((item) => (
            <li
              key={item.productId}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-700">{item.productName}</span>
              <span className="text-gray-500">
                ×{item.quantity}{item.unit}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-orange-600">
          ¥{order.totalAmount.toFixed(2)}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(order.createdAt).toLocaleString("zh-CN")}
        </span>
      </div>

      {actions && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          {actions}
        </div>
      )}
    </div>
  );
}
