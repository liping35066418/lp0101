import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  Package,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react";
import { fetchOrderById, pickupOrder } from "@/lib/api";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import type { Order, OrderStatus } from "@/lib/types";
import Modal from "@/components/Modal";

const TIMELINE_STEPS: {
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
}[] = [
  { status: "pending", label: "待分拣", icon: <Clock size={16} /> },
  { status: "sorting", label: "分拣中", icon: <Package size={16} /> },
  { status: "sorted", label: "已分拣", icon: <Package size={16} /> },
  { status: "ready_for_pickup", label: "待取货", icon: <CheckCircle size={16} /> },
  { status: "picked_up", label: "已取货", icon: <CheckCircle size={16} /> },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  pending: 0,
  sorting: 1,
  sorted: 2,
  ready_for_pickup: 3,
  overdue: 3,
  picked_up: 4,
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupLoading, setPickupLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchOrderById(id)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  const handlePickup = async () => {
    if (!id) return;
    setPickupLoading(true);
    try {
      const updated = await pickupOrder(id);
      setOrder(updated);
      setShowPickupModal(false);
    } catch (error) {
      console.error("Failed to pickup order:", error);
    } finally {
      setPickupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-400">订单不存在</p>
        <button
          onClick={() => navigate("/customer/orders")}
          className="mt-3 text-sm text-green-600"
        >
          返回订单列表
        </button>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER[order.status];
  const isOverdue = order.status === "overdue";
  const canPickup =
    order.status === "ready_for_pickup" || order.status === "overdue";
  const storageFee = order.storageFee || 0;
  const itemsTotal = order.items.reduce((s, i) => s + i.subtotal, 0);

  const formatTime = (iso: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/customer/orders")}
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">订单详情</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-4">
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">订单编号</p>
              <p className="text-sm font-medium text-gray-900">
                #{order.id.slice(0, 8)}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[order.status]}`}
            >
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">客户姓名</p>
              <p className="font-medium text-gray-900">{order.customerName}</p>
            </div>
            <div>
              <p className="text-gray-500">联系电话</p>
              <p className="font-medium text-gray-900">{order.customerPhone}</p>
            </div>
            <div>
              <p className="text-gray-500">下单时间</p>
              <p className="font-medium text-gray-900">
                {formatTime(order.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">取货截止</p>
              <p className="font-medium text-gray-900">
                {formatTime(order.pickupDeadline)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            订单状态
          </h2>
          <div className="relative">
            <div className="absolute left-[11px] top-4 h-[calc(100%-32px)] w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {TIMELINE_STEPS.map((step, idx) => {
                const isActive = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={step.status} className="relative flex items-center gap-3">
                    <div
                      className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        isActive
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-400"
                      } ${isCurrent ? "ring-2 ring-green-200" : ""}`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`text-sm ${
                        isActive ? "font-medium text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCurrent && isOverdue && (
                      <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        <AlertTriangle size={12} />
                        逾期
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {isOverdue && (
              <div className="relative mt-4 flex items-center gap-3">
                <div
                  className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white ring-2 ring-red-200`}
                >
                  <AlertTriangle size={14} />
                </div>
                <span className="text-sm font-medium text-red-600">
                  逾期分支
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">商品明细</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.productName}
                  </p>
                  <p className="text-xs text-gray-400">
                    ¥{item.price.toFixed(2)}/{item.unit} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ¥{item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>商品金额</span>
              <span>¥{itemsTotal.toFixed(2)}</span>
            </div>
            {storageFee > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>保管费</span>
                <span>¥{storageFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900">
              <span>应付总额</span>
              <span className="text-red-500">
                ¥{(itemsTotal + storageFee).toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {storageFee > 0 && (
          <section className="rounded-xl border border-red-200 bg-red-50 p-4">
            <h2 className="mb-2 flex items-center gap-1 text-sm font-semibold text-red-700">
              <AlertTriangle size={14} />
              保管费明细
            </h2>
            <div className="space-y-1 text-sm text-red-600">
              <div className="flex justify-between">
                <span>逾期时长</span>
                <span>{order.simulateOverdueHours} 小时</span>
              </div>
              <div className="flex justify-between">
                <span>保管费率</span>
                <span>¥{order.storageFeeRate || 0}/小时</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>保管费合计</span>
                <span>¥{storageFee.toFixed(2)}</span>
              </div>
            </div>
          </section>
        )}

        {canPickup && (
          <button
            onClick={() => setShowPickupModal(true)}
            className="w-full rounded-xl bg-green-600 py-3 text-base font-semibold text-white transition-colors hover:bg-green-700"
          >
            取货结算
          </button>
        )}
      </main>

      <Modal
        open={showPickupModal}
        onClose={() => setShowPickupModal(false)}
        title="取货结算确认"
      >
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>商品金额</span>
            <span>¥{itemsTotal.toFixed(2)}</span>
          </div>
          {storageFee > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>保管费（逾期 {order.simulateOverdueHours} 小时）</span>
              <span>¥{storageFee.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t pt-3">
            <div className="flex justify-between text-base font-bold">
              <span>应付总额</span>
              <span className="text-red-500">
                ¥{(itemsTotal + storageFee).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowPickupModal(false)}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handlePickup}
              disabled={pickupLoading}
              className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {pickupLoading ? "处理中..." : "确认取货"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
