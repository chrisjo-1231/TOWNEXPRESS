
import { Router } from "express";

import {
  registerStoreOwner,
  getMyStore,
  updateMyStoreProfile,
  uploadMyStoreLogo,
} from "../controllers/store-owner.controller.js";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

import storeLogoUpload from "../middlewares/store-logo.middleware.js";

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Register Store Owner
router.post(
  "/register",
  registerStoreOwner
);

// ============================================
// PROTECTED STORE OWNER ROUTES
// ============================================

// Get My Store
router.get(
  "/my-store",
  authenticate,
  authorize("STORE_OWNER"),
  getMyStore
);

// Update My Store Profile
router.patch(
  "/my-store",
  authenticate,
  authorize("STORE_OWNER"),
  updateMyStoreProfile
);

// Upload Store Logo
router.post(
  "/my-store/logo",
  authenticate,
  authorize("STORE_OWNER"),
  storeLogoUpload.single("logo"),
  uploadMyStoreLogo
);

export default router;
