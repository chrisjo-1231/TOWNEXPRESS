
import { Router } from "express";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notificatioon.controller.js";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate, authorize("STORE_OWNER"));

router.get("/", getNotifications);
router.patch("/read-all", markAllNotificationsAsRead);
router.patch("/:id/read", markNotificationAsRead);
router.delete("/:id", deleteNotification);

export default router;
