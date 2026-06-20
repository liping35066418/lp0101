import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import type { Order } from "@/lib/types";

interface NearDeadlineModalProps {
  open: boolean;
  onClose: () => void;
  orders: Order[];
}

export default function NearDeadlineModal({ open, onClose, orders }: NearDeadlineModalProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      timerRef.current = setTimeout(() => {
        onClose();
      }, 30000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [open, onClose]);

  if (!open || orders.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-800">取货提醒</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          以下订单即将到达取货截止时间，请及时提醒客户！
        </p>

        <ul className="mb-4 max-h-60 space-y-3 overflow-y-auto">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-lg border border-amber-200 bg-amber-50/50 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-gray-800">
                  {order.id}
                </span>
                <span className="text-xs text-amber-600 font-medium">
                  {new Date(order.pickupDeadline).toLocaleString("zh-CN")}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {order.customerName} | {order.customerPhone}
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={onClose}
          className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
        >
          我知道了
        </button>
      </div>
    </div>
  );
}
