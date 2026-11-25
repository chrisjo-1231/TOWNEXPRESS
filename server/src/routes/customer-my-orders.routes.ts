
import { Router } from "express";

import {
  getCustomerOrders,
  getCustomerOrderById,
} from "../controllers/customer-my-orders.controller.js";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorize("CUSTOMER"));

router.get("/", getCustomerOrders);
router.get("/:id", getCustomerOrderById);

export default router;
