
import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";

// ============================================
// VALIDATION
// ============================================

const productSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters."),
  description: z.string().trim().optional().nullable(),
  price: z.coerce.number().positive("Price must be greater than zero."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  image: z.string().trim().optional().nullable(),
  isAvailable: z.boolean().optional(),
});

const updateProductSchema = productSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Please provide at least one field to update." }
);

// ============================================
// HELPERS
// ============================================

function getParamId(req: Request): string | null {
  const id = req.params.id;
  return typeof id === "string" && id.trim() ? id : null;
}

function getUserId(req: Request): string | null {
  return req.user?.id || null;
}

function formatProduct(product: any) {
  return {
    ...product,
    price: Number(product.price),
  };
}

// ============================================
// GET MY STORE
// ============================================

async function getApprovedStore(ownerId: string) {
  return prisma.store.findFirst({
    where: {
      ownerId,
      status: "APPROVED",
      isActive: true,
    },
  });
}

// ============================================
// GET ALL MY PRODUCTS
// GET /api/products
// ============================================

export async function getMyProducts(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const store = await getApprovedStore(userId);

    if (!store) {
      return res.status(403).json({
        success: false,
        message: "Your store must be approved and active to manage products.",
      });
    }

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const products = await prisma.product.findMany({
      where: {
        storeId: store.id,
        ...(search
          ? {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      products: products.map(formatProduct),
      total: products.length,
    });
  } catch (error) {
    console.error("GET MY PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve products.",
    });
  }
}

// ============================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// ============================================

export async function getProductById(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const productId = getParamId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        store: {
          ownerId: userId,
          status: "APPROVED",
          isActive: true,
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product retrieved successfully.",
      product: formatProduct(product),
    });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve product.",
    });
  }
}

// ============================================
// CREATE PRODUCT
// POST /api/products
// ============================================

export async function createProduct(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const validation = productSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid product information.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const store = await getApprovedStore(userId);

    if (!store) {
      return res.status(403).json({
        success: false,
        message: "Your store must be approved and active to add products.",
      });
    }

    const data = validation.data;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        stock: data.stock,
        image: data.image || null,
        isAvailable: data.isAvailable ?? true,
        storeId: store.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product: formatProduct(product),
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product.",
    });
  }
}

// ============================================
// UPDATE PRODUCT
// PATCH /api/products/:id
// ============================================

export async function updateProduct(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const productId = getParamId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const validation = updateProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid product information.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        store: {
          ownerId: userId,
          status: "APPROVED",
          isActive: true,
        },
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not have permission to update it.",
      });
    }

    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: validation.data,
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: formatProduct(product),
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product.",
    });
  }
}

// ============================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ============================================

export async function deleteProduct(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const productId = getParamId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        store: {
          ownerId: userId,
          status: "APPROVED",
          isActive: true,
        },
      },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not have permission to delete it.",
      });
    }

    if (product._count.orderItems > 0) {
      return res.status(409).json({
        success: false,
        message: "This product already has order records. You can mark it unavailable instead of deleting it.",
      });
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product.",
    });
  }
}
