import { z } from "zod";

export const signupSchema = z.object({
  fullname: z.string().min(1, "Please provide your full name.").max(255),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Please provide your password.").max(255),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z
    .string()
    .min(8, "Password is too short. Minimum 8 characters required.")
    .max(255),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const updateAccountSchema = z.object({
  fullname: z.string().min(1, "Please provide your full name.").max(255),
  email: z.string().email("Please enter a valid email"),
});
export type updateAccountInput = z.infer<typeof updateAccountSchema>;

export const updatePasswordSchema = z.object({
  current_password: z
    .string()
    .min(8, "Password is too short. Minimum 8 characters required.")
    .max(255),
  new_password: z
    .string()
    .min(8, "Password is too short. Minimum 8 characters required.")
    .max(255),
  confirm_password: z
    .string()
    .min(8, "Password is too short. Minimum 8 characters required.")
    .max(255),
});
export type updatePasswordInput = z.infer<typeof updatePasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Invalid token"),
  password: z.string().min(8, "Password is too short").max(255),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
