import { useNavigate } from "react-router-dom";
import { ShoppingCart, ClipboardList } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 to-orange-50 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">生鲜订单分拣系统</h1>
        <p className="mt-2 text-gray-500">线上下单 · 智能分拣 · 超时保管扣费</p>
      </div>

      <div className="flex w-full max-w-lg gap-4">
        <button
          onClick={() => navigate("/customer")}
          className="flex flex-1 flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
            <ShoppingCart className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">顾客端</p>
            <p className="mt-1 text-sm text-gray-500">浏览商品、在线下单</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/admin/sorter")}
          className="flex flex-1 flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">
            <ClipboardList className="h-8 w-8 text-orange-600" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">分拣员后台</p>
            <p className="mt-1 text-sm text-gray-500">订单分拣、逾期管理</p>
          </div>
        </button>
      </div>

      <div className="mt-12 grid max-w-lg grid-cols-3 gap-4 text-center">
        <div className="rounded-xl bg-white/80 px-4 py-3">
          <p className="text-2xl font-bold text-green-600">1</p>
          <p className="mt-1 text-xs text-gray-500">在线下单</p>
        </div>
        <div className="rounded-xl bg-white/80 px-4 py-3">
          <p className="text-2xl font-bold text-blue-600">2</p>
          <p className="mt-1 text-xs text-gray-500">分拣配货</p>
        </div>
        <div className="rounded-xl bg-white/80 px-4 py-3">
          <p className="text-2xl font-bold text-orange-600">3</p>
          <p className="mt-1 text-xs text-gray-500">取货结算</p>
        </div>
      </div>
    </div>
  );
}
