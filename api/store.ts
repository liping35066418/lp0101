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

export const STORAGE_FEE_PER_HOUR = 2;

const products: Product[] = [
  { id: "p1", name: "有机番茄", price: 8.9, unit: "斤", category: "蔬菜", stock: 100, imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh red organic tomatoes on white background, realistic food photography&image_size=square_hd" },
  { id: "p2", name: "新鲜黄瓜", price: 5.5, unit: "斤", category: "蔬菜", stock: 80, imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh green cucumber on white background, realistic food photography&image_size=square_hd" },
  { id: "p3", name: "红富士苹果", price: 12.8, unit: "斤", category: "水果", stock: 120, imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh red Fuji apples on white background, realistic food photography&image_size=square_hd" },
  { id: "p4", name: "进口香蕉", price: 6.9, unit: "斤", category: "水果", stock: 90, imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh yellow bananas on white background, realistic food photography&image_size=square_hd" },
  { id: "p5", name: "土鸡蛋", price: 28.0, unit: "盒", category: "蛋奶", stock: 50, imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh farm eggs in carton on white background, realistic food photography&image_size=square_hd" },
  { id: "p6", name: "鲜牛奶", price: 15.5, unit: "瓶", category: "蛋奶", stock: 60, imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh milk bottle on white background, realistic food photography&image_size=square_hd" },
  { id: "p7", name: "黑猪五花肉", price: 35.0, unit: "斤", category: "肉类", stock: 40, imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh pork belly on white background, realistic food photography&image_size=square_hd" },
  { id: "p8", name: "三文鱼柳", price: 59.9, unit: "盒", category: "海鲜", stock: 25, imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh salmon fillet on white background, realistic food photography&image_size=square_hd" },
  { id: "p9", name: "大虾", price: 45.0, unit: "斤", category: "海鲜", stock: 30, imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh shrimp on white background, realistic food photography&image_size=square_hd" },
  { id: "p10", name: "有机菠菜", price: 6.5, unit: "斤", category: "蔬菜", stock: 70, imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh organic spinach on white background, realistic food photography&image_size=square_hd" },
  { id: "p11", name: "草莓", price: 25.0, unit: "盒", category: "水果", stock: 45, imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh strawberries in box on white background, realistic food photography&image_size=square_hd" },
  { id: "p12", name: "鸡胸肉", price: 22.0, unit: "斤", category: "肉类", stock: 55, imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh chicken breast on white background, realistic food photography&image_size=square_hd" },
];

const orders: Order[] = [];
let orderCounter = 1000;

export function getProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getOrders(): Order[] {
  return orders;
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function createOrder(
  customerName: string,
  customerPhone: string,
  items: OrderItem[],
  pickupHours: number,
  simulateOverdueHours: number = 0
): Order {
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  orderCounter++;
  const now = new Date();
  const deadline = new Date(
    now.getTime() + pickupHours * 60 * 60 * 1000
  );

  if (simulateOverdueHours > 0) {
    const adjustedDeadline = new Date(
      now.getTime() - simulateOverdueHours * 60 * 60 * 1000
    );
    const order: Order = {
      id: `ORD${orderCounter}`,
      customerName,
      customerPhone,
      items,
      totalAmount,
      status: "overdue",
      createdAt: now.toISOString(),
      pickupDeadline: adjustedDeadline.toISOString(),
      sortedAt: now.toISOString(),
      pickedUpAt: null,
      storageFee: calculateStorageFee(adjustedDeadline, now, simulateOverdueHours),
      storageFeeRate: STORAGE_FEE_PER_HOUR,
      simulateOverdueHours,
    };
    orders.unshift(order);
    return order;
  }

  const order: Order = {
    id: `ORD${orderCounter}`,
    customerName,
    customerPhone,
    items,
    totalAmount,
    status: "pending",
    createdAt: now.toISOString(),
    pickupDeadline: deadline.toISOString(),
    sortedAt: null,
    pickedUpAt: null,
    storageFee: 0,
    storageFeeRate: STORAGE_FEE_PER_HOUR,
    simulateOverdueHours: 0,
  };
  orders.unshift(order);
  return order;
}

export function calculateStorageFee(
  deadline: Date,
  now: Date,
  simulateOverdueHours: number = 0
): number {
  if (simulateOverdueHours > 0) {
    const hours = Math.ceil(simulateOverdueHours);
    return hours * STORAGE_FEE_PER_HOUR;
  }
  const diffMs = now.getTime() - deadline.getTime();
  if (diffMs <= 0) return 0;
  const hours = Math.ceil(diffMs / (1000 * 60 * 60));
  return hours * STORAGE_FEE_PER_HOUR;
}

export function startSorting(orderId: string): Order | null {
  const order = orders.find((o) => o.id === orderId);
  if (!order || order.status !== "pending") return null;
  order.status = "sorting";
  return order;
}

export function completeSorting(orderId: string): Order | null {
  const order = orders.find((o) => o.id === orderId);
  if (!order || order.status !== "sorting") return null;
  order.status = "ready_for_pickup";
  order.sortedAt = new Date().toISOString();
  return order;
}

export function pickupOrder(orderId: string): Order | null {
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;
  if (!["ready_for_pickup", "overdue"].includes(order.status)) return null;

  const now = new Date();
  const deadline = new Date(order.pickupDeadline);
  const storageFee = calculateStorageFee(deadline, now, order.simulateOverdueHours);

  order.status = "picked_up";
  order.pickedUpAt = now.toISOString();
  order.storageFee = storageFee;
  return order;
}

export function refreshOverdueStatus(): Order[] {
  const now = new Date();
  for (const order of orders) {
    if (order.status === "ready_for_pickup") {
      const deadline = new Date(order.pickupDeadline);
      if (now > deadline) {
        order.status = "overdue";
        order.storageFee = calculateStorageFee(deadline, now, order.simulateOverdueHours);
      }
    } else if (order.status === "overdue") {
      const deadline = new Date(order.pickupDeadline);
      order.storageFee = calculateStorageFee(deadline, now, order.simulateOverdueHours);
    }
  }
  return orders;
}

export function getTodayOrders(): Order[] {
  const today = new Date().toISOString().slice(0, 10);
  return orders.filter(
    (o) => o.createdAt.slice(0, 10) === today
  );
}

export function getPendingOrders(): Order[] {
  return orders.filter((o) => o.status === "pending");
}

export function getSortingOrders(): Order[] {
  return orders.filter((o) => o.status === "sorting");
}

export function getReadyForPickupOrders(): Order[] {
  return orders.filter((o) => o.status === "ready_for_pickup");
}

export function getOverdueOrders(): Order[] {
  return orders.filter((o) => o.status === "overdue");
}

export function getNearDeadlineOrders(minutesThreshold: number = 30): Order[] {
  const now = new Date();
  const threshold = new Date(now.getTime() + minutesThreshold * 60 * 1000);
  return orders.filter((o) => {
    if (o.status !== "ready_for_pickup") return false;
    const deadline = new Date(o.pickupDeadline);
    return deadline <= threshold && deadline > now;
  });
}
