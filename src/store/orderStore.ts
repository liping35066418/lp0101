import { create } from "zustand";
import type { Product, CartItem, Order } from "../lib/types";
import {
  fetchProducts as apiFetchProducts,
  fetchOrders as apiFetchOrders,
  createOrder as apiCreateOrder,
  fetchPendingOrders,
  fetchReadyForPickupOrders,
  fetchOverdueOrders,
  fetchNearDeadlineOrders,
} from "../lib/api";
import type { OrderItem } from "../lib/types";

interface OrderStore {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  pendingOrders: Order[];
  readyOrders: Order[];
  overdueOrders: Order[];
  nearDeadlineOrders: Order[];
  loading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;

  fetchOrders: () => Promise<void>;
  fetchPendingOrders: () => Promise<void>;
  fetchReadyOrders: () => Promise<void>;
  fetchOverdueOrders: () => Promise<void>;
  fetchNearDeadlineOrders: (minutes?: number) => Promise<void>;
  placeOrder: (
    customerName: string,
    customerPhone: string,
    pickupHours: number,
    simulateOverdueHours: number
  ) => Promise<Order | null>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  products: [],
  cart: [],
  orders: [],
  pendingOrders: [],
  readyOrders: [],
  overdueOrders: [],
  nearDeadlineOrders: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await apiFetchProducts();
      set({ products, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "请求失败", loading: false });
    }
  },

  addToCart: (product, quantity = 1) => {
    const cart = [...get().cart];
    const existing = cart.find((c) => c.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ product, quantity });
    }
    set({ cart });
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((c) => c.product.id !== productId) });
  },

  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const cart = get().cart.map((c) =>
      c.product.id === productId ? { ...c, quantity } : c
    );
    set({ cart });
  },

  clearCart: () => set({ cart: [] }),

  getCartTotal: () => {
    return get().cart.reduce(
      (sum, c) => sum + c.product.price * c.quantity,
      0
    );
  },

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await apiFetchOrders();
      set({ orders, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "请求失败", loading: false });
    }
  },

  fetchPendingOrders: async () => {
    try {
      const pendingOrders = await fetchPendingOrders();
      set({ pendingOrders });
    } catch (e) {
      console.error("Failed to fetch pending orders:", e);
    }
  },

  fetchReadyOrders: async () => {
    try {
      const readyOrders = await fetchReadyForPickupOrders();
      set({ readyOrders });
    } catch (e) {
      console.error("Failed to fetch ready orders:", e);
    }
  },

  fetchOverdueOrders: async () => {
    try {
      const overdueOrders = await fetchOverdueOrders();
      set({ overdueOrders });
    } catch (e) {
      console.error("Failed to fetch overdue orders:", e);
    }
  },

  fetchNearDeadlineOrders: async (minutes = 30) => {
    try {
      const nearDeadlineOrders = await fetchNearDeadlineOrders(minutes);
      set({ nearDeadlineOrders });
    } catch (e) {
      console.error("Failed to fetch near deadline orders:", e);
    }
  },

  placeOrder: async (customerName, customerPhone, pickupHours, simulateOverdueHours) => {
    set({ loading: true, error: null });
    try {
      const items: OrderItem[] = get().cart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        price: c.product.price,
        quantity: c.quantity,
        unit: c.product.unit,
        subtotal: c.product.price * c.quantity,
      }));
      const order = await apiCreateOrder(
        customerName,
        customerPhone,
        items,
        pickupHours,
        simulateOverdueHours
      );
      set({ cart: [], loading: false });
      get().fetchOrders();
      return order;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "请求失败", loading: false });
      return null;
    }
  },
}));
