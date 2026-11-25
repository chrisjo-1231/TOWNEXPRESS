
import { Router } from "express";

import {
  getDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
} from "../controllers/admin-delivery-zone.controller.js";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", getDeliveryZones);
router.post("/", createDeliveryZone);
router.patch("/:id", updateDeliveryZone);
router.delete("/:id", deleteDeliveryZone);

export default router;
