import { useState, useEffect, useCallback } from "react";
import { Play, CheckCircle, Clock, AlertTriangle, Bell, RefreshCw } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { startSorting, completeSorting } from "@/lib/api";
import type { Order } from "@/lib/types";
import OrderCard from "@/components/OrderCard";
import NearDeadlineModal from "@/components/NearDeadlineModal";

type TabKey = "pending" | "sorting" | "ready" | "overdue";

const TABS: { key: TabKey; label: string; icon: typeof Play }[] = [
  { key: "pending", label: "待分拣", icon: Play },
  { key: "sorting", label: "分拣中", icon: Clock },
  { key: "ready", label: "待取货", icon: CheckCircle },
  { key: "overdue", label: "逾期订单", icon: AlertTriangle },
];

function CountdownTimer({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(deadline).getTime() - Date.now())
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(Math.max(0, new Date(deadline).getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isUrgent = remaining < 30 * 60 * 1000;

  return (
    <span className={`font-mono text-sm ${isUrgent ? "text-red-600 font-bold" : "text-gray-600"}`}>
      {hours > 0 ? `${hours}时` : ""}
      {minutes}分{seconds}秒
    </span>
  );
}

function OverdueFee({ order }: { order: Order }) {
  return (
    <span className="font-mono text-sm text-red-600 font-bold">
      ¥{order.storageFee.toFixed(2)}
    </span>
  );
}

function OverdueDuration({ deadline }: { deadline: string }) {
  const [hours, setHours] = useState(() => {
    const ms = Date.now() - new Date(deadline).getTime();
    return Math.max(0, ms / 3600000);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const ms = Date.now() - new Date(deadline).getTime();
      setHours(Math.max(0, ms / 3600000));
    }, 60000);
    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <span className="text-sm text-red-600 font-medium">
      {hours < 1 ? `${Math.floor(hours * 60)}分钟` : `${hours.toFixed(1)}小时`}
    </span>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sortingOrders, setSortingOrders] = useState<Order[]>([]);

  const {
    pendingOrders,
    readyOrders,
    overdueOrders,
    nearDeadlineOrders,
    loading,
    fetchPendingOrders,
    fetchOrders,
    fetchReadyOrders,
    fetchOverdueOrders,
    fetchNearDeadlineOrders,
  } = useOrderStore();

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchPendingOrders(),
      fetchOrders(),
      fetchReadyOrders(),
      fetchOverdueOrders(),
    ]);
  }, [fetchPendingOrders, fetchOrders, fetchReadyOrders, fetchOverdueOrders]);

  const loadSortingOrders = useCallback(async () => {
    await fetchOrders();
    const allOrders = useOrderStore.getState().orders;
    setSortingOrders(allOrders.filter((o) => o.status === "sorting"));
  }, [fetchOrders]);

  useEffect(() => {
    refreshAll();
    loadSortingOrders();
  }, [refreshAll, loadSortingOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshAll();
      loadSortingOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshAll, loadSortingOrders]);

  useEffect(() => {
    const checkDeadline = async () => {
      await fetchNearDeadlineOrders(30);
      const orders = useOrderStore.getState().nearDeadlineOrders;
      if (orders.length > 0) {
        setShowDeadlineModal(true);
      }
    };
    checkDeadline();
    const interval = setInterval(checkDeadline, 30000);
    return () => clearInterval(interval);
  }, [fetchNearDeadlineOrders]);

  const handleStartSorting = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await startSorting(orderId);
      await Promise.all([fetchPendingOrders(), loadSortingOrders()]);
    } catch (error) {
      console.error("Failed to start sorting:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteSorting = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await completeSorting(orderId);
      await Promise.all([loadSortingOrders(), fetchReadyOrders()]);
    } catch (error) {
      console.error("Failed to complete sorting:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const tabCounts: Record<TabKey, number> = {
    pending: pendingOrders.length,
    sorting: sortingOrders.length,
    ready: readyOrders.length,
    overdue: overdueOrders.length,
  };

  const renderPendingActions = (order: Order) => (
    <button
      onClick={() => handleStartSorting(order.id)}
      disabled={actionLoading === order.id}
      className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
    >
      <Play className="h-3.5 w-3.5" />
      {actionLoading === order.id ? "处理中..." : "开始分拣"}
    </button>
  );

  const renderSortingActions = (order: Order) => (
    <button
      onClick={() => handleCompleteSorting(order.id)}
      disabled={actionLoading === order.id}
      className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
    >
      <CheckCircle className="h-3.5 w-3.5" />
      {actionLoading === order.id ? "处理中..." : "分拣完成"}
    </button>
  );

  const renderReadyExtra = (order: Order) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">取货截止时间</span>
        <span className="text-sm font-medium text-gray-700">
          {new Date(order.pickupDeadline).toLocaleString("zh-CN")}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">剩余时间</span>
        <CountdownTimer deadline={order.pickupDeadline} />
      </div>
      {order.storageFee > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">当前仓储费</span>
          <span className="text-sm font-medium text-red-600">
            ¥{order.storageFee.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );

  const renderOverdueExtra = (order: Order) => (
    <div className="space-y-2 rounded-md bg-red-50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">原取货截止时间</span>
        <span className="text-sm text-gray-700">
          {new Date(order.pickupDeadline).toLocaleString("zh-CN")}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">逾期时长</span>
        <OverdueDuration deadline={order.pickupDeadline} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">累计仓储费（2元/小时）</span>
        <OverdueFee order={order} />
      </div>
    </div>
  );

  const getTabOrders = (): Order[] => {
    switch (activeTab) {
      case "pending":
        return pendingOrders;
      case "sorting":
        return sortingOrders;
      case "ready":
        return readyOrders;
      case "overdue":
        return overdueOrders;
    }
  };

  const currentOrders = getTabOrders();

  return (
    <div className="min-h-screen bg-gray-50">
      <NearDeadlineModal
        open={showDeadlineModal}
        onClose={() => setShowDeadlineModal(false)}
        orders={nearDeadlineOrders}
      />

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">分拣管理后台</h1>
              <p className="text-sm text-gray-500">生鲜订单分拣系统</p>
            </div>
          </div>
          <button
            onClick={refreshAll}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </button>
        </div>

        <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {tabCounts[key] > 0 && (
                <span
                  className={`ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                    activeTab === key
                      ? key === "overdue"
                        ? "bg-red-500 text-white"
                        : "bg-orange-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {tabCounts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && currentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <RefreshCw className="mb-3 h-8 w-8 animate-spin" />
            <p className="text-sm">加载中...</p>
          </div>
        ) : currentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Clock className="mb-3 h-8 w-8" />
            <p className="text-sm">暂无{TABS.find((t) => t.key === activeTab)?.label}订单</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {currentOrders.map((order) => (
              <div key={order.id}>
                <OrderCard
                  order={order}
                  actions={
                    activeTab === "pending"
                      ? renderPendingActions(order)
                      : activeTab === "sorting"
                        ? renderSortingActions(order)
                        : undefined
                  }
                />
                {activeTab === "ready" && renderReadyExtra(order)}
                {activeTab === "overdue" && renderOverdueExtra(order)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
