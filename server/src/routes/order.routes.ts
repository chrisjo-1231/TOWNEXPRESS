
import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

import {
  getMyOrders,
  getMyOrderById,
  updateMyOrderStatus,
} from "../controllers/order.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorize("STORE_OWNER"));

router.get("/", getMyOrders);
router.get("/:id", getMyOrderById);
router.patch("/:id/status", updateMyOrderStatus);

export default router;
