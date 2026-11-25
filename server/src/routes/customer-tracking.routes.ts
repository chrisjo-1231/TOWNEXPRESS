
import { Router } from "express";

import {
  getCustomerOrderTracking,
} from "../controllers/customer-tracking.controller.js";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorize("CUSTOMER"));

// Track a specific customer order
router.get("/:id", getCustomerOrderTracking);

export default router;
