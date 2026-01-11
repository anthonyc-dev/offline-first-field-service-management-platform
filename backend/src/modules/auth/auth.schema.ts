import { z } from "zod";

/* ===============================
   Reusable primitives (DRY)
================================ */

const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Email format is invalid");

const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .refine((val) => val.length >= 8, {
    message: "Password must be at least 8 characters",
  });

const fullNameSchema = z
  .string()
  .min(1, "Full name is required")
  .refine((val) => val.length >= 2, {
    message: "Full name must be at least 2 characters",
  });

const phoneNumberSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine((val) => val.length >= 7, {
    message: "Phone number must be at least 7 characters",
  });

/* ===============================
   Schemas
================================ */

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});

export const registerSchema = z.object({
  body: z.object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    phoneNumber: phoneNumberSchema,
  }),
});

export const refreshSchema = z.object({
  body: z.object({}).optional(),
});
