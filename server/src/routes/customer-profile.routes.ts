import { Router } from "express";

import {
  getCustomerProfile,
  updateCustomerProfile,
  changeCustomerPassword,
} from "../controllers/customer-profile.controller.js";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorize("CUSTOMER"));

router.get("/", getCustomerProfile);
router.patch("/", updateCustomerProfile);
router.patch("/change-password", changeCustomerPassword);

export default router;