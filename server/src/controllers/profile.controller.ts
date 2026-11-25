
import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import prisma from "../config/prisma.js";

const getProfileImagePath = (image: string) =>
  path.join(process.cwd(), "uploads", "profiles", image);

export async function uploadProfilePicture(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a profile picture.",
      });
    }

    const user = (await prisma.user.findUnique({
      where: { id: userId },
    })) as unknown as { profileImage: string | null } | null;

    if (!user) {
      fs.unlinkSync(req.file.path);

      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const profileImage = `/uploads/profiles/${req.file.filename}`;

    await prisma.user.update({
      where: { id: userId },
      data: { profileImage: profileImage },
    });

    // Delete previous profile image
    if (user.profileImage) {
      const oldFilename = path.basename(user.profileImage);
      const oldPath = getProfileImagePath(oldFilename);

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully.",
      profileImage,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Upload profile picture error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload profile picture.",
    });
  }
}

export async function removeProfilePicture(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const user = (await prisma.user.findUnique({
      where: { id: userId },
    })) as unknown as { profileImage: string | null } | null;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.profileImage) {
      const filename = path.basename(user.profileImage);
      const imagePath = getProfileImagePath(filename);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { profileImage: null },
    });

    return res.status(200).json({
      success: true,
      message: "Profile picture removed successfully.",
      profileImage: null,
    });
  } catch (error) {
    console.error("Remove profile picture error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove profile picture.",
    });
  }
}
