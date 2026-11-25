
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../config/prisma.js";
import { generateToken } from "../utils/jwt.js";

// ============================================
// VALIDATION SCHEMAS
// ============================================

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().toLowerCase(),
  phone: z.string().trim().min(7).max(20).optional(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  phone: z.string().trim().min(7).max(20).nullable().optional(),
}).refine(
  (data) => Object.values(data).some((value) => value !== undefined),
  { message: "Please provide at least one field to update." }
);

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
}).refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: "New password must be different from your current password.",
    path: ["newPassword"],
  }
);

// ============================================
// CUSTOMER REGISTRATION
// ============================================

export const register = async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration details.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { name, email, phone, password } = validation.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or phone number is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: "CUSTOMER",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register user.",
    });
  }
};

// ============================================
// LOGIN
// ============================================

export const login = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email and password.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // STORE OWNER APPROVAL CHECK

    if (user.role === "STORE_OWNER") {
      const store = await prisma.store.findFirst({
        where: {
          ownerId: user.id,
        },
        select: {
          id: true,
          name: true,
          status: true,
          isActive: true,
          rejectionReason: true,
        },
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: "No store application was found for this account.",
        });
      }

      if (store.status === "PENDING") {
        return res.status(403).json({
          success: false,
          message: "Your store application is still waiting for admin approval.",
          status: store.status,
        });
      }

      if (store.status === "REJECTED") {
        return res.status(403).json({
          success: false,
          message: "Your store application was rejected.",
          status: store.status,
          rejectionReason: store.rejectionReason,
        });
      }

      if (
        store.status === "SUSPENDED" ||
        store.status !== "APPROVED" ||
        !store.isActive
      ) {
        return res.status(403).json({
          success: false,
          message: "Your store account is currently unavailable.",
          status: store.status,
        });
      }
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to login.",
    });
  }
};

// ============================================
// GET CURRENT USER
// ============================================

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    if (user.role === "STORE_OWNER") {
      const store = await prisma.store.findFirst({
        where: {
          ownerId: user.id,
        },
        select: {
          status: true,
          isActive: true,
        },
      });

      if (!store || store.status !== "APPROVED" || !store.isActive) {
        return res.status(403).json({
          success: false,
          message: "Your store is not yet approved or is currently unavailable.",
          status: store?.status ?? null,
        });
      }
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve current user.",
    });
  }
};

// ============================================
// UPDATE ACCOUNT PROFILE
// ============================================

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const validation = updateProfileSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile details.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { name, email, phone } = validation.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        id: { not: userId },
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or phone number is already used by another account.",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Account profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update account profile.",
    });
  }
};

// ============================================
// CHANGE PASSWORD
// ============================================

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const validation = changePasswordSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid password details.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { currentPassword, newPassword } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
};
