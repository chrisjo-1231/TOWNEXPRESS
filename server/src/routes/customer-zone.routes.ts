
import { Router } from "express";

import { getCustomerDeliveryZones } from "../controllers/customer-zone.controller.js";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorize("CUSTOMER"));

router.get("/", getCustomerDeliveryZones);

export default router;
