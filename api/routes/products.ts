import { Router, type Request, type Response } from "express";
import { getProducts, getProductById } from "../store.js";

const router = Router();

router.get("/", (_req: Request, res: Response): void => {
  const products = getProducts();
  res.json({ success: true, data: products });
});

router.get("/:id", (req: Request, res: Response): void => {
  const product = getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: "商品不存在" });
    return;
  }
  res.json({ success: true, data: product });
});

export default router;
