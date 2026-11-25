
import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";

const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

export async function getAllUsers(req: Request, res: Response) {
  try {
    const { role, status, search } = req.query;

    const where: any = {};

    if (
      typeof role === "string" &&
      ["ADMIN", "STORE_OWNER", "STORE_STAFF", "RIDER", "CUSTOMER"].includes(role)
    ) {
      where.role = role;
    }

    if (status === "ACTIVE") where.isActive = true;
    if (status === "INACTIVE") where.isActive = false;

    if (typeof search === "string" && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
        { phone: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users.",
    });
  }
}

export async function updateUserStatus(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const validation = updateStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid account status.",
        errors: validation.error.flatten(),
      });
    }

    const { isActive } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prevent an admin from deactivating their own account.
    const currentUserId = (
      req as Request & { user?: { id: string } }
    ).user?.id;

    if (!isActive && currentUserId === user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account.",
      });
    }

    // Prevent deactivation of the last active admin.
    if (!isActive && user.role === "ADMIN" && user.isActive) {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
          isActive: true,
        },
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "You cannot deactivate the last active administrator.",
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User account activated successfully."
        : "User account deactivated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE USER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user account status.",
    });
  }
}
