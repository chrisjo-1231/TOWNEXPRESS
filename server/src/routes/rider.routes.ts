
import { Router } from "express";

import {
  getMyRiderProfile,
  getRiderDashboard,
  getAssignedDeliveries,
  updateRiderDeliveryStatus,
  getAvailableDeliveries,
  requestDelivery,
  getRiderEarnings,
  getRiderDeliveryHistory,
   updateRiderProfile,
  updateRiderAvailability,
  changeRiderPassword,
} from "../controllers/rider.controller.js";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorize("RIDER"));

// RIDER PROFILE
router.get("/profile", getMyRiderProfile);

// RIDER DASHBOARD
router.get("/dashboard", getRiderDashboard);

// AVAILABLE DELIVERIES
router.get("/available-deliveries", getAvailableDeliveries);
router.post("/delivery-requests/:orderId", requestDelivery);

// ASSIGNED DELIVERIES
router.get("/assigned-deliveries", getAssignedDeliveries);
router.patch("/deliveries/:id/status", updateRiderDeliveryStatus);

// EARNINGS AND DELIVERY HISTORY
router.get("/earnings", getRiderEarnings);
router.get("/delivery-history", getRiderDeliveryHistory);

// UPDATE RIDER PROFILE
router.patch("/profile", updateRiderProfile);
router.patch("/availability", updateRiderAvailability);
router.patch("/change-password", changeRiderPassword);
export default router;
