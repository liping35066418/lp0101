import { Router, type Request, type Response } from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  startSorting,
  completeSorting,
  pickupOrder,
  refreshOverdueStatus,
  getPendingOrders,
  getSortingOrders,
  getReadyForPickupOrders,
  getOverdueOrders,
  getNearDeadlineOrders,
  getTodayOrders,
  calculateStorageFee,
  STORAGE_FREE_HOURS,
  STORAGE_FEE_TIER1_RATE,
  STORAGE_FEE_TIER1_HOURS,
  STORAGE_FEE_TIER2_RATE,
  STORAGE_FEE_MAX_RATIO,
} from "../store.js";

const router = Router();

router.get("/", (_req: Request, res: Response): void => {
  refreshOverdueStatus();
  const orders = getOrders();
  res.json({ success: true, data: orders });
});

router.get("/pending", (_req: Request, res: Response): void => {
  const orders = getPendingOrders();
  res.json({ success: true, data: orders });
});

router.get("/sorting", (_req: Request, res: Response): void => {
  const orders = getSortingOrders();
  res.json({ success: true, data: orders });
});

router.get("/ready-for-pickup", (_req: Request, res: Response): void => {
  refreshOverdueStatus();
  const orders = getReadyForPickupOrders();
  res.json({ success: true, data: orders });
});

router.get("/overdue", (_req: Request, res: Response): void => {
  refreshOverdueStatus();
  const orders = getOverdueOrders();
  res.json({ success: true, data: orders });
});

router.get("/near-deadline", (req: Request, res: Response): void => {
  const minutes = parseInt(req.query.minutes as string) || 30;
  const orders = getNearDeadlineOrders(minutes);
  res.json({ success: true, data: orders });
});

router.get("/:id", (req: Request, res: Response): void => {
  const order = getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: "订单不存在" });
    return;
  }
  res.json({ success: true, data: order });
});

router.post("/", (req: Request, res: Response): void => {
  const { customerName, customerPhone, items, pickupHours, simulateOverdueHours } = req.body;
  if (!customerName || !customerPhone || !items || !items.length) {
    res.status(400).json({ success: false, error: "缺少必要参数" });
    return;
  }
  const order = createOrder(
    customerName,
    customerPhone,
    items,
    pickupHours || 2,
    simulateOverdueHours || 0
  );
  res.status(201).json({ success: true, data: order });
});

router.patch("/:id/start-sorting", (req: Request, res: Response): void => {
  const order = startSorting(req.params.id);
  if (!order) {
    res.status(400).json({ success: false, error: "无法开始分拣，请检查订单状态" });
    return;
  }
  res.json({ success: true, data: order });
});

router.patch("/:id/complete-sorting", (req: Request, res: Response): void => {
  const order = completeSorting(req.params.id);
  if (!order) {
    res.status(400).json({ success: false, error: "无法完成分拣，请检查订单状态" });
    return;
  }
  res.json({ success: true, data: order });
});

router.patch("/:id/pickup", (req: Request, res: Response): void => {
  const order = pickupOrder(req.params.id);
  if (!order) {
    res.status(400).json({ success: false, error: "无法取货，请检查订单状态" });
    return;
  }
  res.json({ success: true, data: order });
});

router.post("/calculate-fee", (req: Request, res: Response): void => {
  const { overdueHours, totalAmount = 0 } = req.body;
  if (typeof overdueHours !== "number" || overdueHours < 0) {
    res.status(400).json({ success: false, error: "无效的超时小时数" });
    return;
  }
  const now = new Date();
  const deadline = new Date(now.getTime() - overdueHours * 60 * 60 * 1000);
  const fee = calculateStorageFee(deadline, now, totalAmount, overdueHours);
  res.json({
    success: true,
    data: {
      overdueHours,
      fee,
      freeHours: STORAGE_FREE_HOURS,
      tier1Rate: STORAGE_FEE_TIER1_RATE,
      tier1Hours: STORAGE_FEE_TIER1_HOURS,
      tier2Rate: STORAGE_FEE_TIER2_RATE,
      maxRatio: STORAGE_FEE_MAX_RATIO,
      totalAmount,
      maxFee: totalAmount > 0 ? totalAmount * STORAGE_FEE_MAX_RATIO : null,
    },
  });
});

router.get("/overview/today", (_req: Request, res: Response): void => {
  refreshOverdueStatus();
  const todayOrders = getTodayOrders();
  const allOrders = getOrders();
  const totalOrders = todayOrders.length;
  const pendingCount = allOrders.filter((o) => o.status === "ready_for_pickup").length;
  const overdueCount = getOverdueOrders().length;
  const totalStorageFee = todayOrders
    .filter((o) => o.status === "picked_up")
    .reduce((sum, o) => sum + o.storageFee, 0);

  res.json({
    success: true,
    data: {
      totalOrders,
      pendingCount,
      overdueCount,
      totalStorageFee,
    },
  });
});

export default router;
