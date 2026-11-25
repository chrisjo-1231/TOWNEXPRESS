
import { Router } from "express";
import {
  getAllUsers,
  updateUserStatus,
} from "../controllers/admin-user.controller.js";
import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", getAllUsers);
router.patch("/:id/status", updateUserStatus);

export default router;
