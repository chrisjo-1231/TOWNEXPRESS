
import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authenticate, getMe);
router.patch("/profile", authenticate, updateProfile);
router.patch("/change-password", authenticate, changePassword);

export default router;
