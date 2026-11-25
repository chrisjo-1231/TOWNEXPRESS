
import type { Request, Response } from "express";
import { randomBytes } from "crypto";
import { z } from "zod";
import prisma from "../config/prisma.js";

// ============================================
// VALIDATION
// ============================================

const checkoutSchema = z.object({
  storeId: z.string().min(1),
  zoneId: z.string().min(1),
  deliveryAddress: z.string().trim().min(10).max(500),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["CASH", "COD", "GCASH"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .min(1)
    .max(50),
});

// ============================================
// GENERATE ORDER NUMBER
// ============================================

function generateOrderNumber() {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  const random = randomBytes(4).toString("hex").toUpperCase();

  return `TE-${date}-${random}`;
}

// ============================================
// CUSTOMER CHECKOUT
// ============================================

export async function checkout(req: Request, res: Response) {
  try {
    const customerId = req.user!.id;

    const validation = checkoutSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkout information.",
        errors: validation.error.flatten(),
      });
    }

    const {
      storeId,
      zoneId,
      deliveryAddress,
      notes,
      paymentMethod,
      items,
    } = validation.data;

    // Combine duplicate product IDs.
    const quantityMap = new Map<string, number>();

    for (const item of items) {
      quantityMap.set(
        item.productId,
        (quantityMap.get(item.productId) || 0) + item.quantity
      );
    }

    const requestedItems = Array.from(quantityMap.entries()).map(
      ([productId, quantity]) => ({
        productId,
        quantity,
      })
    );

    const result = await prisma.$transaction(async (tx) => {
      // ========================================
      // CHECK CUSTOMER
      // ========================================

      const customer = await tx.user.findFirst({
        where: {
          id: customerId,
          role: "CUSTOMER",
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (!customer) {
        throw new Error("CUSTOMER_NOT_FOUND");
      }

      // ========================================
      // CHECK STORE
      // ========================================

      const store = await tx.store.findFirst({
        where: {
          id: storeId,
          status: "APPROVED",
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          ownerId: true,
        },
      });

      if (!store) {
        throw new Error("STORE_NOT_AVAILABLE");
      }

      // ========================================
      // CHECK DELIVERY ZONE
      // ========================================

      const zone = await tx.deliveryZone.findFirst({
        where: {
          id: zoneId,
          isActive: true,
        },
      });

      if (!zone) {
        throw new Error("DELIVERY_ZONE_NOT_AVAILABLE");
      }

      // ========================================
      // CHECK PRODUCTS AND STOCK
      // ========================================

      const products = await tx.product.findMany({
        where: {
          id: {
            in: requestedItems.map((item) => item.productId),
          },
          storeId,
          isAvailable: true,
        },
      });

      if (products.length !== requestedItems.length) {
        throw new Error("PRODUCT_NOT_AVAILABLE");
      }

      let subtotalCents = 0;

      const orderItems = requestedItems.map((requested) => {
        const product = products.find(
          (item) => item.id === requested.productId
        );

        if (!product) {
          throw new Error("PRODUCT_NOT_AVAILABLE");
        }

        if (product.stock < requested.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
        }

        const unitPriceCents = Math.round(
          Number(product.price) * 100
        );

        const itemSubtotalCents =
          unitPriceCents * requested.quantity;

        subtotalCents += itemSubtotalCents;

        return {
          productId: product.id,
          quantity: requested.quantity,
          unitPrice: (unitPriceCents / 100).toFixed(2),
          subtotal: (itemSubtotalCents / 100).toFixed(2),
        };
      });

      const deliveryFeeCents = Math.round(
        Number(zone.deliveryFee) * 100
      );

      const totalCents = subtotalCents + deliveryFeeCents;

      // ========================================
      // DEDUCT STOCK SAFELY
      // ========================================

      for (const item of requestedItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            storeId,
            isAvailable: true,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count !== 1) {
          throw new Error("STOCK_CHANGED");
        }
      }

      // ========================================
      // CREATE ORDER
      // ========================================

      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          status: "PENDING",

          subtotal: (subtotalCents / 100).toFixed(2),
          deliveryFee: (deliveryFeeCents / 100).toFixed(2),
          totalAmount: (totalCents / 100).toFixed(2),

          deliveryAddress,
          notes: notes || null,

          customerId,
          storeId,
          zoneId,

          items: {
            create: orderItems,
          },

          payment: {
            create: {
              method: paymentMethod,
              status: "UNPAID",
              amount: (totalCents / 100).toFixed(2),
            },
          },

          statusHistory: {
            create: {
              status: "PENDING",
              remarks: "Order placed by customer.",
            },
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          payment: true,
          zone: true,
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // ========================================
      // NOTIFY STORE OWNER
      // ========================================

      await tx.notification.create({
        data: {
          userId: store.ownerId,
          title: "New Customer Order",
          message: `You received a new order ${order.orderNumber}.`,
        },
      });

      return order;
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: {
        ...result,
        subtotal: Number(result.subtotal),
        deliveryFee: Number(result.deliveryFee),
        totalAmount: Number(result.totalAmount),
        items: result.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
        })),
        payment: result.payment
          ? {
              ...result.payment,
              amount: Number(result.payment.amount),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("CUSTOMER CHECKOUT ERROR:", error);

    if (error instanceof Error) {
      const messages: Record<string, string> = {
        CUSTOMER_NOT_FOUND: "Customer account not found or inactive.",
        STORE_NOT_AVAILABLE: "This store is currently unavailable.",
        DELIVERY_ZONE_NOT_AVAILABLE: "Selected delivery zone is unavailable.",
        PRODUCT_NOT_AVAILABLE: "One or more products are unavailable.",
        STOCK_CHANGED: "Product stock changed. Please review your cart.",
      };

      if (messages[error.message]) {
        return res.status(400).json({
          success: false,
          message: messages[error.message],
        });
      }

      if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
        const productName = error.message.split(":")[1];

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${productName}.`,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to place order. Please try again.",
    });
  }
}
