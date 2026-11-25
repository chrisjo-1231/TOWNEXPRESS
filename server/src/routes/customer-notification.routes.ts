
import { Router } from "express";

import {
  getCustomerNotifications,
  markCustomerNotificationAsRead,
  markAllCustomerNotificationsAsRead,
} from "../controllers/customer-notification.controller.js";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorize("CUSTOMER"));

router.get("/", getCustomerNotifications);
router.patch("/read-all", markAllCustomerNotificationsAsRead);
router.patch("/:id/read", markCustomerNotificationAsRead);

export default router;
