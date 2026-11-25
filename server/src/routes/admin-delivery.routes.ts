import { Router } from "express";
import {
  getAllDeliveries,
  getDeliveryDetails,
  getAvailableRiders,
  assignRider,
} from "../controllers/admin-delivery.controller.js";

import {
  getAllDeliveryRequests,
  approveDeliveryRequest,
  rejectDeliveryRequest,
} from "../controllers/admin-delivery-request.controller.js";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use((req, res, next) => {
  console.log("ADMIN DELIVERY ROUTER HIT:", req.method, req.originalUrl);
  next();
});

// TEMPORARY TEST ROUTE
router.get("/test-requests", (_req, res) => {
  console.log("TEST REQUEST ROUTE HIT");

  res.json({
    success: true,
    message: "Admin delivery routes are loaded!",
  });
});

router.use(authenticate);
router.use(authorize("ADMIN"));

// DELIVERY REQUESTS
router.get("/requests", getAllDeliveryRequests);
router.patch("/requests/:id/approve", approveDeliveryRequest);
router.patch("/requests/:id/reject", rejectDeliveryRequest);

// DELIVERY MANAGEMENT
router.get("/", getAllDeliveries);
router.get("/available-riders", getAvailableRiders);
router.patch("/:id/assign-rider", assignRider);
router.get("/:id", getDeliveryDetails);

export default router;