
import type { Request, Response } from "express";
import prisma from "../config/prisma.js";

// GET CUSTOMER NOTIFICATIONS
export async function getCustomerNotifications(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = notifications.filter(
      (notification) => !notification.isRead
    ).length;

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      totalCount: notifications.length,
    });
  } catch (error) {
    console.error("Get customer notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications.",
    });
  }
}

// MARK ONE NOTIFICATION AS READ
export async function markCustomerNotificationAsRead(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user?.id;
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const result = await prisma.notification.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        isRead: true,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error("Mark customer notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
    });
  }
}

// MARK ALL NOTIFICATIONS AS READ
export async function markAllCustomerNotificationsAsRead(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark all customer notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
    });
  }
}
