
import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";

// ============================================
// HELPER: GET STORE ID
// ============================================

function getStoreId(req: Request): string | null {
  const id = req.params.id;

  if (typeof id === "string" && id.length > 0) {
    return id;
  }

  if (Array.isArray(id) && typeof id[0] === "string") {
    return id[0];
  }

  return null;
}

// ============================================
// VALIDATION SCHEMA
// ============================================

const rejectStoreSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Rejection reason must be at least 5 characters.")
    .max(500, "Rejection reason must not exceed 500 characters."),
});

// ============================================
// GET PENDING STORE APPLICATIONS
// ============================================

export const getPendingStores = async (
  _req: Request,
  res: Response
) => {
  try {
    const stores = await prisma.store.findMany({
      where: {
        isActive: false,
        rejectionReason: null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: stores.length,
      stores,
    });
  } catch (error) {
    console.error("GET PENDING STORES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve pending store applications.",
    });
  }
};

// ============================================
// GET ALL STORES
// ============================================

export const getAllStores = async (
  _req: Request,
  res: Response
) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: stores.length,
      stores,
    });
  } catch (error) {
    console.error("GET ALL STORES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve stores.",
    });
  }
};

// ============================================
// APPROVE STORE
// ============================================

export const approveStore = async (
  req: Request,
  res: Response
) => {
  try {
    const id = getStoreId(req);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Valid store ID is required.",
      });
    }

    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    const storeStatus = (store as typeof store & { status: string }).status;

    if (storeStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve a store with ${storeStatus} status.`,
      });
    }

    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        status: "APPROVED",
        isActive: true,
        rejectionReason: null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Store application approved successfully.",
      store: updatedStore,
    });
  } catch (error) {
    console.error("APPROVE STORE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve store.",
    });
  }
};

// ============================================
// REJECT STORE
// ============================================

export const rejectStore = async (
  req: Request,
  res: Response
) => {
  try {
    const id = getStoreId(req);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Valid store ID is required.",
      });
    }

    const validation = rejectStoreSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "A valid rejection reason is required.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    const storeStatus = (store as typeof store & { status: string }).status;

    if (storeStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a store with ${storeStatus} status.`,
      });
    }

    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        status: "REJECTED",
        isActive: false,
        rejectionReason: validation.data.reason,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Store application rejected successfully.",
      store: updatedStore,
    });
  } catch (error) {
    console.error("REJECT STORE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject store.",
    });
  }
};

// ============================================
// SUSPEND STORE
// ============================================

export const suspendStore = async (
  req: Request,
  res: Response
) => {
  try {
    const id = getStoreId(req);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Valid store ID is required.",
      });
    }

    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    if (!store.isActive) {
      return res.status(400).json({
        success: false,
        message: "Only approved stores can be suspended.",
      });
    }

    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        status: "SUSPENDED",
        isActive: false,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Store suspended successfully.",
      store: updatedStore,
    });
  } catch (error) {
    console.error("SUSPEND STORE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to suspend store.",
    });
  }
};
