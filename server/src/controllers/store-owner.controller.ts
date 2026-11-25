
import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import fs from "fs";
import path from "path";

// ============================================
// STORE OWNER REGISTRATION VALIDATION
// ============================================

const storeOwnerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().toLowerCase(),
  phone: z.string().trim().min(7).max(20).optional().or(z.literal("")),
  password: z.string().min(8).max(72),

  storeName: z.string().trim().min(2).max(150),
  storeDescription: z.string().trim().max(1000).optional(),
  storeAddress: z.string().trim().min(5),
  barangay: z.string().trim().min(2),
  storePhone: z.string().trim().min(7).max(20).optional().or(z.literal("")),

  category: z.enum([
    "GROCERY",
    "RESTAURANT",
    "PHARMACY",
    "WATER_STATION",
    "CONVENIENCE_STORE",
    "BAKERY",
    "OTHER",
  ]),
});

// ============================================
// CREATE STORE SLUG
// ============================================

function createSlug(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${base}-${Date.now().toString(36)}`;
}

// ============================================
// REGISTER STORE OWNER
// ============================================

export const registerStoreOwner = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = storeOwnerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Please check your registration details.",
        errors: parsed.error.flatten(),
      });
    }

    const data = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or phone number is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          passwordHash,
          role: "STORE_OWNER",
          isActive: true,
        },
      });

      const store = await tx.store.create({
        data: {
          name: data.storeName,
          slug: createSlug(data.storeName),
          description: data.storeDescription || null,
          address: data.storeAddress,
          barangay: data.barangay,
          phone: data.storePhone || null,
          category: data.category,
          status: "PENDING",
          isActive: false,
          ownerId: newUser.id,
        },
      });

      return { newUser, store };
    });

    return res.status(201).json({
      success: true,
      message:
        "Store registration submitted successfully. Please wait for admin approval.",
      user: {
        id: result.newUser.id,
        name: result.newUser.name,
        email: result.newUser.email,
        role: result.newUser.role,
      },
      store: {
        id: result.store.id,
        name: result.store.name,
        status: result.store.status,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "Email, phone, or store information already exists.",
      });
    }

    console.error("Store owner registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to register store owner.",
    });
  }
};

// ============================================
// GET MY STORE / STORE OWNER DASHBOARD
// ============================================

export const getMyStore = async (
  req: Request,
  res: Response
) => {
  try {
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const store = await prisma.store.findFirst({
      where: { ownerId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        barangay: true,
        phone: true,
        logo: true,
        category: true,
        status: true,
        rejectionReason: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "No store found for this account.",
      });
    }

    const [
      pendingOrders,
      confirmedOrders,
      preparingOrders,
      readyForPickupOrders,
      assignedOrders,
      pickedUpOrders,
      outForDeliveryOrders,
      completedOrders,
      cancelledOrders,
      sales,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: { storeId: store.id, status: "PENDING" },
      }),
      prisma.order.count({
        where: { storeId: store.id, status: "CONFIRMED" },
      }),
      prisma.order.count({
        where: { storeId: store.id, status: "PREPARING" },
      }),
      prisma.order.count({
        where: { storeId: store.id, status: "READY_FOR_PICKUP" },
      }),
      prisma.order.count({
        where: { storeId: store.id, status: "ASSIGNED" },
      }),
      prisma.order.count({
        where: { storeId: store.id, status: "PICKED_UP" },
      }),
      prisma.order.count({
        where: { storeId: store.id, status: "OUT_FOR_DELIVERY" },
      }),
      prisma.order.count({
        where: { storeId: store.id, status: "DELIVERED" },
      }),
      prisma.order.count({
        where: { storeId: store.id, status: "CANCELLED" },
      }),
      prisma.order.aggregate({
        where: {
          storeId: store.id,
          status: "DELIVERED",
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.order.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Store dashboard loaded successfully.",
      store: {
        ...store,
        _count: store._count,
      },
      stats: {
        totalProducts: store._count.products,
        totalOrders: store._count.orders,
        pendingOrders,
        confirmedOrders,
        preparingOrders,
        readyForPickupOrders,
        assignedOrders,
        pickedUpOrders,
        outForDeliveryOrders,
        completedOrders,
        cancelledOrders,
        totalSales: Number(sales._sum.totalAmount || 0),
      },
      recentOrders: recentOrders.map((order) => ({
        ...order,
        totalAmount: Number(order.totalAmount),
      })),
    });
  } catch (error) {
    console.error("Get my store error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load store dashboard.",
    });
  }
};

// ============================================
// UPDATE MY STORE PROFILE
// ============================================

const updateStoreProfileSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  address: z.string().trim().min(5).optional(),
  barangay: z.string().trim().min(2).optional(),
  phone: z.string().trim().min(7).max(20).nullable().optional(),
  category: z.enum([
    "GROCERY",
    "RESTAURANT",
    "PHARMACY",
    "WATER_STATION",
    "CONVENIENCE_STORE",
    "BAKERY",
    "OTHER",
  ]).optional(),
}).strict();

export const updateMyStoreProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const parsed = updateStoreProfileSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Please check your store information.",
        errors: parsed.error.flatten(),
      });
    }

    const data = parsed.data;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update.",
      });
    }

    const existingStore = await prisma.store.findFirst({
      where: { ownerId },
      select: { id: true },
    });

    if (!existingStore) {
      return res.status(404).json({
        success: false,
        message: "No store found for this account.",
      });
    }

    const updatedStore = await prisma.store.update({
      where: { id: existingStore.id },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        barangay: true,
        phone: true,
        logo: true,
        category: true,
        status: true,
        rejectionReason: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Store profile updated successfully.",
      store: updatedStore,
    });
  } catch (error) {
    console.error("Update store profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update store profile.",
    });
  }
};

// ============================================
// UPLOAD MY STORE LOGO
// ============================================

export const uploadMyStoreLogo = async (
  req: Request,
  res: Response
) => {
  let uploadedFilePath: string | null = null;

  try {
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Confirm Multer received the logo.
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No logo file received. Please select a logo.",
      });
    }

    uploadedFilePath = req.file.path;

    console.log("STORE LOGO UPLOAD:", {
      originalName: req.file.originalname,
      filename: req.file.filename,
      destination: req.file.destination,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    const store = await prisma.store.findFirst({
      where: { ownerId },
      select: {
        id: true,
        logo: true,
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "No store found for this account.",
      });
    }

    const logoPath = `/uploads/stores/${req.file.filename}`;

    // Save new logo path in database.
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: { logo: logoPath },
      select: {
        id: true,
        name: true,
        logo: true,
        updatedAt: true,
      },
    });

    // Delete previous local logo only after successful DB update.
    if (
      store.logo &&
      store.logo.startsWith("/uploads/stores/")
    ) {
      const oldFileName = path.basename(store.logo);
      const oldFilePath = path.join(
        process.cwd(),
        "uploads",
        "stores",
        oldFileName
      );

      if (
        fs.existsSync(oldFilePath) &&
        oldFilePath !== uploadedFilePath
      ) {
        fs.unlinkSync(oldFilePath);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Store logo uploaded successfully.",
      store: updatedStore,
    });
  } catch (error) {
    console.error("Upload store logo error:", error);

    // Remove newly uploaded file if database update fails.
    if (
      uploadedFilePath &&
      fs.existsSync(uploadedFilePath)
    ) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (cleanupError) {
        console.error("Store logo cleanup error:", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Unable to upload store logo.",
    });
  }
};
