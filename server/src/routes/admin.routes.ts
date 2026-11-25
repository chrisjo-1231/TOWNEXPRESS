import { Router } from "express";

import {
  getPendingStores,
  getAllStores,
  approveStore,
  rejectStore,
  suspendStore,
} from "../controllers/admin-store.controller.js";

import {
  getAllDeliveries,
  getDeliveryDetails,
} from "../controllers/admin-delivery.controller.js";
import {
  getAllRiders,
  registerRider,
  getRiderDetails,
  updateRiderStatus,
  updateRiderAvailability,
} from "../controllers/admin-rider.controller.js";
import {
  getAdminDashboardStats,
} from "../controllers/admin-dashboard.controller.js";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();

// ADMIN authentication
router.use(authenticate);
router.use(authorize("ADMIN"));

// Dashboard
router.get("/dashboard/stats", getAdminDashboardStats);

// Store management
router.get("/stores/pending", getPendingStores);
router.get("/stores", getAllStores);

router.patch("/stores/:id/approve", approveStore);
router.patch("/stores/:id/reject", rejectStore);
router.patch("/stores/:id/suspend", suspendStore);

router.get("/deliveries", getAllDeliveries);
router.get("/deliveries/:id", getDeliveryDetails);

// Rider management
router.get("/riders", getAllRiders);
router.post("/riders", registerRider);
router.get("/riders/:id", getRiderDetails);
router.patch("/riders/:id/status", updateRiderStatus);
router.patch("/riders/:id/availability", updateRiderAvailability);

export default router;