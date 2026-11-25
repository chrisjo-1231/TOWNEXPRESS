
import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";

// ============================================
// VALIDATION
// ============================================

const storeQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.enum([
    "GROCERY",
    "RESTAURANT",
    "PHARMACY",
    "WATER_STATION",
    "CONVENIENCE_STORE",
    "BAKERY",
    "OTHER",
  ]).optional(),
  barangay: z.string().trim().max(100).optional(),
});

const productQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
});

// ============================================
// GET APPROVED STORES
// GET /api/customer/stores
// ============================================

export const getCustomerStores = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = storeQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid store search filters.",
        errors: parsed.error.flatten(),
      });
    }

    const { search, category, barangay } = parsed.data;

    const stores = await prisma.store.findMany({
      where: {
        status: "APPROVED",
        isActive: true,

        ...(category ? { category } : {}),

        ...(barangay
          ? {
              barangay: {
                contains: barangay,
                mode: "insensitive",
              },
            }
          : {}),

        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  barangay: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },

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
        createdAt: true,

        _count: {
          select: {
            products: {
              where: {
                isAvailable: true,
                stock: {
                  gt: 0,
                },
              },
            },
          },
        },
      },

      orderBy: {
        name: "asc",
      },

      take: 100,
    });

    return res.status(200).json({
      success: true,
      message: "Stores loaded successfully.",
      total: stores.length,
      stores,
    });
  } catch (error) {
    console.error("Get customer stores error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load stores.",
    });
  }
};

// ============================================
// GET SINGLE STORE DETAILS
// GET /api/customer/stores/:id
// ============================================

export const getCustomerStoreById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID.",
      });
    }

    const store = await prisma.store.findFirst({
      where: {
        id,
        status: "APPROVED",
        isActive: true,
      },

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

        _count: {
          select: {
            products: {
              where: {
                isAvailable: true,
                stock: {
                  gt: 0,
                },
              },
            },
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or currently unavailable.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Store details loaded successfully.",
      store,
    });
  } catch (error) {
    console.error("Get customer store details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load store details.",
    });
  }
};

// ============================================
// GET STORE PRODUCTS
// GET /api/customer/stores/:id/products
// ============================================

export const getCustomerStoreProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const parsed = productQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid product search.",
        errors: parsed.error.flatten(),
      });
    }

    const { search } = parsed.data;

    const store = await prisma.store.findFirst({
      where: {
        id,
        status: "APPROVED",
        isActive: true,
      },

      select: {
        id: true,
        name: true,
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or currently unavailable.",
      });
    }

    const products = await prisma.product.findMany({
      where: {
        storeId: store.id,
        isAvailable: true,
        stock: {
          gt: 0,
        },

        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },

      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        image: true,
        isAvailable: true,
        createdAt: true,
      },

      orderBy: {
        name: "asc",
      },

      take: 100,
    });

    return res.status(200).json({
      success: true,
      message: "Store products loaded successfully.",
      store,
      total: products.length,
      products: products.map((product) => ({
        ...product,
        price: Number(product.price),
      })),
    });
  } catch (error) {
    console.error("Get customer store products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load store products.",
    });
  }
};
