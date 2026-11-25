import { Router } from "express";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

import {
  getSalesReport,
} from "../controllers/sales-report.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorize("STORE_OWNER"));

router.get("/", getSalesReport);

export default router;