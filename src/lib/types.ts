export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  stock: number;
  imageUrl: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

export type OrderStatus =
  | "pending"
  | "sorting"
  | "sorted"
  | "ready_for_pickup"
  | "overdue"
  | "picked_up";

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  pickupDeadline: string;
  sortedAt: string | null;
  pickedUpAt: string | null;
  storageFee: number;
  storageFeeRate: number;
  simulateOverdueHours: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "待分拣",
  sorting: "分拣中",
  sorted: "已分拣",
  ready_for_pickup: "待取货",
  overdue: "已逾期",
  picked_up: "已取货",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  sorting: "bg-blue-100 text-blue-800",
  sorted: "bg-indigo-100 text-indigo-800",
  ready_for_pickup: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  picked_up: "bg-gray-100 text-gray-800",
};
