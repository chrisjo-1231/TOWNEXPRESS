
import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";

// ============================================
// GET STORE STAFF
// ============================================

export const getStoreStaff = async (req: Request, res: Response) => {
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
      select: { id: true },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "No store found for this account.",
      });
    }

    const members = await prisma.storeMember.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Store staff loaded successfully.",
      staff: members,
    });
  } catch (error) {
    console.error("Get store staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load store staff.",
    });
  }
};

// ============================================
// ADD STORE STAFF
// ============================================

const createStaffSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().toLowerCase(),
  phone: z.string().trim().min(7).max(20).optional().or(z.literal("")),
  password: z.string().min(8).max(72),
  title: z.string().trim().max(100).optional().or(z.literal("")),
});

export const createStoreStaff = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const parsed = createStaffSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Please check the staff information.",
        errors: parsed.error.flatten(),
      });
    }

    const data = parsed.data;

    const store = await prisma.store.findFirst({
      where: { ownerId },
      select: { id: true },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "No store found for this account.",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or phone number is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const member = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          passwordHash,
          role: "STORE_STAFF",
          isActive: true,
        },
      });

      return tx.storeMember.create({
        data: {
          userId: user.id,
          storeId: store.id,
          title: data.title || null,
          status: "ACTIVE",
        },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true,
            },
          },
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Staff account created successfully.",
      staff: member,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "Email or phone number is already registered.",
      });
    }

    console.error("Create store staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create staff account.",
    });
  }
};

// ============================================
// UPDATE STORE STAFF INFORMATION
// ============================================

const updateStaffSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().min(7).max(20).nullable().optional(),
  title: z.string().trim().max(100).nullable().optional(),
}).strict();

export const updateStoreStaff = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.id;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!ownerId || !id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const parsed = updateStaffSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Please check the staff information.",
        errors: parsed.error.flatten(),
      });
    }

    const data = parsed.data;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide information to update.",
      });
    }

    const member = await prisma.storeMember.findFirst({
      where: {
        id,
        store: { ownerId },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found.",
      });
    }

    if (data.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone: data.phone,
          NOT: { id: member.userId },
        },
        select: { id: true },
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone number is already registered.",
        });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: member.userId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.phone !== undefined && { phone: data.phone || null }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
        },
      });

      const updatedMember = await tx.storeMember.update({
        where: { id: member.id },
        data: {
          ...(data.title !== undefined && { title: data.title || null }),
        },
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
        },
      });

      return { ...updatedMember, user };
    });

    return res.status(200).json({
      success: true,
      message: "Staff information updated successfully.",
      staff: updated,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "Phone number is already registered.",
      });
    }

    console.error("Update store staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update staff information.",
    });
  }
};

// ============================================
// UPDATE STAFF STATUS
// ============================================

const staffStatusSchema = z.object({
  status: z.enum(["INVITED", "ACTIVE", "DISABLED"]),
});

export const updateStoreStaffStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const ownerId = req.user?.id;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Staff member ID is required.",
      });
    }

    const parsed = staffStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff status.",
        errors: parsed.error.flatten(),
      });
    }

    const member = await prisma.storeMember.findFirst({
      where: {
        id,
        store: { ownerId },
      },
      select: { id: true },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found.",
      });
    }

    const updated = await prisma.storeMember.update({
      where: { id: member.id },
      data: { status: parsed.data.status },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Staff status updated successfully.",
      staff: updated,
    });
  } catch (error) {
    console.error("Update staff status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update staff status.",
    });
  }
};

// ============================================
// REMOVE STORE STAFF
// ============================================

export const removeStoreStaff = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.id;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Staff member ID is required.",
      });
    }

    const member = await prisma.storeMember.findFirst({
      where: {
        id,
        store: { ownerId },
      },
      select: { id: true },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found.",
      });
    }

    await prisma.storeMember.delete({
      where: { id: member.id },
    });

    return res.status(200).json({
      success: true,
      message: "Staff removed from your store successfully.",
    });
  } catch (error) {
    console.error("Remove store staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove staff member.",
    });
  }
};
