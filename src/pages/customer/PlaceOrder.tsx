import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, Clock, AlertTriangle } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { calculateFee } from "@/lib/api";
import { getStorageFeeBreakdown, STORAGE_FREE_HOURS, STORAGE_FEE_TIER1_RATE, STORAGE_FEE_TIER1_HOURS, STORAGE_FEE_TIER2_RATE, STORAGE_FEE_MAX_RATIO } from "@/lib/utils";

export default function PlaceOrder() {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    getCartTotal,
    updateCartQuantity,
    removeFromCart,
    placeOrder,
  } = useOrderStore();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupHours, setPickupHours] = useState(4);
  const [simulateOverdueHours, setSimulateOverdueHours] = useState(0);
  const [feePreview, setFeePreview] = useState<{
    fee: number;
    breakdown: ReturnType<typeof getStorageFeeBreakdown>;
  } | null>(null);

  const itemsTotal = getCartTotal();

  useEffect(() => {
    if (simulateOverdueHours > 0) {
      calculateFee(simulateOverdueHours, itemsTotal).then((data) => {
        const breakdown = getStorageFeeBreakdown(simulateOverdueHours, itemsTotal);
        setFeePreview({ fee: data.fee, breakdown });
      }).catch(() => {
        setFeePreview(null);
      });
    } else {
      setFeePreview(null);
    }
  }, [simulateOverdueHours, itemsTotal]);

  const totalAmount = itemsTotal + (feePreview?.fee ?? 0);

  const handlePlaceOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) return;
    const order = await placeOrder(
      customerName.trim(),
      customerPhone.trim(),
      pickupHours,
      simulateOverdueHours
    );
    if (order) {
      navigate("/customer/orders");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-400">购物车为空</p>
        <button
          onClick={() => navigate("/customer")}
          className="mt-4 rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          去选购
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">确认订单</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-4">
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">商品清单</h2>
          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    ¥{item.product.price.toFixed(2)}/{item.product.unit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      item.quantity <= 1
                        ? removeFromCart(item.product.id)
                        : updateCartQuantity(item.product.id, item.quantity - 1)
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                  >
                    {item.quantity <= 1 ? (
                      <Trash2 size={14} />
                    ) : (
                      <Minus size={14} />
                    )}
                  </button>
                  <span className="min-w-[24px] text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateCartQuantity(item.product.id, item.quantity + 1)
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="w-16 text-right text-sm font-medium text-gray-900">
                  ¥{(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t pt-3 text-right text-sm font-semibold text-gray-700">
            商品合计：¥{itemsTotal.toFixed(2)}
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">客户信息</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">姓名</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="请输入姓名"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">手机号</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="请输入手机号"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            <Clock size={14} className="mb-0.5 mr-1 inline" />
            取货时间
          </h2>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((h) => (
              <button
                key={h}
                onClick={() => setPickupHours(h)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  pickupHours === h
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {h}小时
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="mb-2 flex items-center gap-1 text-sm font-semibold text-amber-800">
            <AlertTriangle size={14} />
            模拟超时
          </h2>
          <p className="mb-3 text-xs text-amber-700">
            输入模拟逾期时长（0-72小时），用于测试逾期保管费计算。设为0表示不模拟超时，订单将在正常取货时间内完成。
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={72}
              value={simulateOverdueHours}
              onChange={(e) => {
                const v = Math.min(72, Math.max(0, Number(e.target.value) || 0));
                setSimulateOverdueHours(v);
              }}
              className="w-24 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <span className="text-sm text-amber-700">小时</span>
          </div>
          {feePreview && simulateOverdueHours > 0 && (
            <div className="mt-3 rounded-lg bg-white p-3 text-sm">
              <div className="mb-2 border-b border-gray-100 pb-2">
                <p className="text-xs text-gray-500">
                  计费规则：取货截止后{STORAGE_FREE_HOURS}小时免费；之后{STORAGE_FEE_TIER1_HOURS}小时内{STORAGE_FEE_TIER1_RATE}元/小时；超过{STORAGE_FEE_TIER1_HOURS}小时后{STORAGE_FEE_TIER2_RATE}元/小时；不满1小时按1小时算；封顶为商品金额的{(STORAGE_FEE_MAX_RATIO * 100).toFixed(0)}%。
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>逾期时长</span>
                  <span>{simulateOverdueHours} 小时</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>计费时长</span>
                  <span>{feePreview.breakdown.billableHours} 小时（向上取整）</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>免费时长</span>
                  <span>{feePreview.breakdown.freeHours} 小时</span>
                </div>
                {feePreview.breakdown.tier1Hours > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>第一档（{STORAGE_FEE_TIER1_RATE}元/小时）</span>
                    <span>{feePreview.breakdown.tier1Hours} 小时 × ¥{STORAGE_FEE_TIER1_RATE} = ¥{(feePreview.breakdown.tier1Hours * STORAGE_FEE_TIER1_RATE).toFixed(2)}</span>
                  </div>
                )}
                {feePreview.breakdown.tier2Hours > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>第二档（{STORAGE_FEE_TIER2_RATE}元/小时）</span>
                    <span>{feePreview.breakdown.tier2Hours} 小时 × ¥{STORAGE_FEE_TIER2_RATE} = ¥{(feePreview.breakdown.tier2Hours * STORAGE_FEE_TIER2_RATE).toFixed(2)}</span>
                  </div>
                )}
                {feePreview.breakdown.maxFee !== null && (
                  <div className="flex justify-between text-gray-600">
                    <span>封顶金额（{(STORAGE_FEE_MAX_RATIO * 100).toFixed(0)}%）</span>
                    <span>¥{feePreview.breakdown.maxFee.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between font-semibold text-red-600">
                <span>保管费合计</span>
                <span>¥{feePreview.fee.toFixed(2)}</span>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">订单总额</span>
            <div className="text-right">
              {feePreview && feePreview.fee > 0 && (
                <p className="text-xs text-gray-400">
                  商品 ¥{itemsTotal.toFixed(2)} + 保管费 ¥
                  {feePreview.fee.toFixed(2)}
                </p>
              )}
              <p className="text-xl font-bold text-red-500">
                ¥{totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </section>

        <button
          onClick={handlePlaceOrder}
          disabled={loading || !customerName.trim() || !customerPhone.trim()}
          className="w-full rounded-xl bg-green-600 py-3 text-base font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "提交中..." : "提交订单"}
        </button>
      </main>
    </div>
  );
}
