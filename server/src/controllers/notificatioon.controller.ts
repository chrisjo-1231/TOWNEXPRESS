
import type { Request, Response } from "express";
import prisma from "../config/prisma.js";

// ============================================
// GET STORE OWNER NOTIFICATIONS
// ============================================

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const [notifications, unreadCount, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),

      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),

      prisma.notification.count({
        where: { userId },
      }),
    ]);

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      totalCount,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications.",
    });
  }
};

// ============================================
// MARK ONE NOTIFICATION AS READ
// ============================================

export const markNotificationAsRead = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required.",
      });
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
    });
  }
};

// ============================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================

export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const result = await prisma.notification.updateMany({
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
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("MARK ALL NOTIFICATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
    });
  }
};

// ============================================
// DELETE NOTIFICATION
// ============================================

export const deleteNotification = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required.",
      });
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    await prisma.notification.delete({
      where: { id: notification.id },
    });

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
    });
  }
};
