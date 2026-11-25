
import { Router } from "express";

import { checkout } from "../controllers/customer-order.controller.js";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorize("CUSTOMER"));

router.post("/checkout", checkout);

export default router;
