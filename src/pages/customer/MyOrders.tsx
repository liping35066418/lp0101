import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import type { OrderStatus } from "@/lib/types";

const STATUS_TABS: { key: OrderStatus | "全部"; label: string }[] = [
  { key: "全部", label: "全部" },
  { key: "pending", label: "待分拣" },
  { key: "sorting", label: "分拣中" },
  { key: "ready_for_pickup", label: "待取货" },
  { key: "overdue", label: "逾期" },
  { key: "picked_up", label: "已取货" },
];

export default function MyOrders() {
  const navigate = useNavigate();
  const { orders, loading, fetchOrders } = useOrderStore();
  const [activeTab, setActiveTab] = useState<OrderStatus | "全部">("全部");

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered =
    activeTab === "全部"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d
      .getHours()
      .toString()
      .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">我的订单</h1>
        </div>
        <div className="flex gap-1 overflow-x-auto px-4 pb-3">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4">
        {loading && orders.length === 0 ? (
          <div className="py-20 text-center text-gray-400">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package size={48} className="mb-3 opacity-50" />
            <p>暂无订单</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/customer/orders/${order.id}`)}
                className="w-full rounded-xl bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      订单 #{order.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatTime(order.createdAt)} · {order.items.length} 件商品
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-gray-500">
                    {order.items.map((i) => i.productName).join("、")}
                  </span>
                  <span className="text-sm font-bold text-red-500">
                    ¥{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
