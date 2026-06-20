import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import type { Product } from "@/lib/types";

const CATEGORIES = [
  { key: "全部", label: "全部" },
  { key: "蔬菜", label: "蔬菜" },
  { key: "水果", label: "水果" },
  { key: "蛋奶", label: "蛋奶" },
  { key: "肉类", label: "肉类" },
  { key: "海鲜", label: "海鲜" },
];

export default function ProductCatalog() {
  const navigate = useNavigate();
  const { products, cart, loading, fetchProducts, addToCart, updateCartQuantity } =
    useOrderStore();
  const [activeCategory, setActiveCategory] = useState("全部");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered =
    activeCategory === "全部"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const getCartQty = (productId: string) =>
    cart.find((c) => c.product.id === productId)?.quantity ?? 0;

  const handleAdd = (product: Product) => {
    const existing = cart.find((c) => c.product.id === product.id);
    if (existing) {
      updateCartQuantity(product.id, existing.quantity + 1);
    } else {
      addToCart(product);
    }
  };

  const handleDecrease = (productId: string) => {
    const existing = cart.find((c) => c.product.id === productId);
    if (existing && existing.quantity > 1) {
      updateCartQuantity(productId, existing.quantity - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">新鲜食材</h1>
        </div>
        <div className="flex gap-1 overflow-x-auto px-4 pb-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat.key
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">
        {loading && products.length === 0 ? (
          <div className="py-20 text-center text-gray-400">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">暂无商品</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((product) => {
              const qty = getCartQty(product.id);
              return (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-xl bg-white shadow-sm"
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="truncate text-sm font-medium text-gray-900">
                      {product.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {product.category} · {product.unit}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-red-500">
                        ¥{product.price.toFixed(2)}
                      </span>
                      {qty === 0 ? (
                        <button
                          onClick={() => handleAdd(product)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700"
                        >
                          <Plus size={16} />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDecrease(product.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-[20px] text-center text-sm font-medium">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleAdd(product)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {cartCount > 0 && (
        <button
          onClick={() => navigate("/customer/cart")}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <ShoppingCart size={24} />
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold">
            {cartCount}
          </span>
        </button>
      )}
    </div>
  );
}
