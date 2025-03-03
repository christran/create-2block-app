import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Please provide your full name.").max(255).regex(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed."),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(255),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(255),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const magigcLinkLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address.")
});
export type MagicLinkInput = z.infer<typeof magigcLinkLoginSchema>;

export const updateAccountSchema = z.object({
  name: z.string().min(1, "Please provide your full name.").max(255).regex(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed."),
  // email: z.string().email("Please enter a valid email address"),
});
export type updateAccountInput = z.infer<typeof updateAccountSchema>;

export const updatePasswordSchema = z.object({
  current_password: z
    .string(),
  new_password: z
    .string()
    .min(8, "Your new password must be at least 8 characters.")
    .max(255),
  confirm_password: z
    .string()
    .min(8, "Your new password must be at least 8 characters.")
    .max(255),
});
export type updatePasswordInput = z.infer<typeof updatePasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Invalid token"),
  password: z.string().min(8, "Password must be at least 8 characters.").max(255),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
