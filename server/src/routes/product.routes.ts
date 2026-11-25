
import { Router } from "express";
import {
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";
const router = Router();

// All product management routes require STORE_OWNER authentication.
router.use(authenticate);
router.use(authorize("STORE_OWNER"));

router.get("/", getMyProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
