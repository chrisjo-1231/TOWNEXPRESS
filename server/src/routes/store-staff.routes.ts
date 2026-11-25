
import { Router } from "express";

import {
  getStoreStaff,
  createStoreStaff,
  updateStoreStaff,
  updateStoreStaffStatus,
  removeStoreStaff,
} from "../controllers/store-staff.controller.js";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate, authorize("STORE_OWNER"));

router.get("/", getStoreStaff);
router.post("/", createStoreStaff);
router.patch("/:id", updateStoreStaff);
router.patch("/:id/status", updateStoreStaffStatus);
router.delete("/:id", removeStoreStaff);

export default router;
