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
  const { overdueHours } = req.body;
  if (typeof overdueHours !== "number" || overdueHours < 0) {
    res.status(400).json({ success: false, error: "无效的超时小时数" });
    return;
  }
  const fee = Math.ceil(overdueHours) * 2;
  res.json({ success: true, data: { overdueHours, fee, rate: 2, unit: "元/小时" } });
});

export default router;
