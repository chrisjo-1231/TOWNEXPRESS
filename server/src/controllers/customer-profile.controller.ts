
import type { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().max(20).optional().nullable(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export async function getCustomerProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET CUSTOMER PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve customer profile.",
    });
  }
}

export async function updateCustomerProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const validation = profileSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message,
      });
    }

    const user = await prisma.user.updateMany({
      where: {
        id: userId,
        role: "CUSTOMER",
      },
      data: {
        name: validation.data.name,
        phone: validation.data.phone || null,
      },
    });

    if (user.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found.",
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE CUSTOMER PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer profile.",
    });
  }
}

export async function changeCustomerPassword(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const validation = passwordSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message,
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "CUSTOMER",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      validation.data.currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      validation.data.newPassword,
      12
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("CHANGE CUSTOMER PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
}
