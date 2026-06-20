import type { Product, Order, OrderItem } from "./types";

const API_BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "请求失败");
  return json.data;
}

export async function fetchProducts(): Promise<Product[]> {
  return request<Product[]>("/products");
}

export async function fetchOrders(): Promise<Order[]> {
  return request<Order[]>("/orders");
}

export async function fetchOrderById(id: string): Promise<Order> {
  return request<Order>(`/orders/${id}`);
}

export async function fetchPendingOrders(): Promise<Order[]> {
  return request<Order[]>("/orders/pending");
}

export async function fetchOverdueOrders(): Promise<Order[]> {
  return request<Order[]>("/orders/overdue");
}

export async function fetchReadyForPickupOrders(): Promise<Order[]> {
  return request<Order[]>("/orders/ready-for-pickup");
}

export async function fetchNearDeadlineOrders(minutes: number = 30): Promise<Order[]> {
  return request<Order[]>(`/orders/near-deadline?minutes=${minutes}`);
}

export async function createOrder(
  customerName: string,
  customerPhone: string,
  items: OrderItem[],
  pickupHours: number,
  simulateOverdueHours: number = 0
): Promise<Order> {
  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify({ customerName, customerPhone, items, pickupHours, simulateOverdueHours }),
  });
}

export async function startSorting(orderId: string): Promise<Order> {
  return request<Order>(`/orders/${orderId}/start-sorting`, { method: "PATCH" });
}

export async function completeSorting(orderId: string): Promise<Order> {
  return request<Order>(`/orders/${orderId}/complete-sorting`, { method: "PATCH" });
}

export async function pickupOrder(orderId: string): Promise<Order> {
  return request<Order>(`/orders/${orderId}/pickup`, { method: "PATCH" });
}

export async function calculateFee(overdueHours: number): Promise<{ overdueHours: number; fee: number; rate: number; unit: string }> {
  return request("/orders/calculate-fee", {
    method: "POST",
    body: JSON.stringify({ overdueHours }),
  });
}
