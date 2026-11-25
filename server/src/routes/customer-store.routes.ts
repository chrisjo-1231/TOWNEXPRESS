
import { Router } from "express";

import {
  getCustomerStores,
  getCustomerStoreById,
  getCustomerStoreProducts,
} from "../controllers/customer-store.controller.js";

const router = Router();

// Public customer store browsing routes.
// No authentication required.

router.get("/", getCustomerStores);
router.get("/:id/products", getCustomerStoreProducts);
router.get("/:id", getCustomerStoreById);

export default router;
