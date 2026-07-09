import { z } from "zod";
import type { Dictionary } from "@/lib/i18n";

/** Slice de messages d'erreur localisés (FR/AR). */
type M = Dictionary["auth"]["errors"];

export function makeRegisterSchema(m: M) {
  return z.object({
    name: z.string().min(2, { message: m.nameMin }).trim(),
    email: z.string().email({ message: m.emailInvalid }).trim(),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, { message: m.passwordMin8 })
      .regex(/[a-zA-Z]/, { message: m.passwordLetter })
      .regex(/[0-9]/, { message: m.passwordDigit }),
  });
}

export function makeLoginSchema(m: M) {
  return z.object({
    email: z.string().email({ message: m.emailInvalid }).trim(),
    password: z.string().min(1, { message: m.passwordRequired }),
  });
}

export function makeForgotPasswordSchema(m: M) {
  return z.object({
    email: z.string().email({ message: m.emailInvalid }).trim(),
  });
}

export function makeResetPasswordSchema(m: M) {
  return z
    .object({
      password: z.string().min(8, { message: m.passwordMin8Short }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: m.passwordsMismatch,
      path: ["confirmPassword"],
    });
}

export type FormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      /** Code stable indépendant de la locale (ex. "UNVERIFIED"). */
      code?: string;
    }
  | undefined;
