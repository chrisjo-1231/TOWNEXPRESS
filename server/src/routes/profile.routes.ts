
import { Router } from "express";

import {
  uploadProfilePicture,
  removeProfilePicture,
} from "../controllers/profile.controller.js";

import profileUpload from "../middlewares/profile-upload.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post(
  "/avatar",
  profileUpload.single("profileImage"),
  uploadProfilePicture
);

router.delete("/avatar", removeProfilePicture);

export default router;
