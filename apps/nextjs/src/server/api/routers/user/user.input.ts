import { z } from "zod";

export const getUserByEmailInput = z.object({
  email: z.string().min(1)
});

export const getUserFilesByFolderInput = z.object({
  folder: z.string().min(1)
});

export const updateContactIdInput = z.object({
  contactId: z.string().min(1)
});

export const updateAvatarInput = z.object({
  avatar: z.string().nullable()
});

export const removeSocialAccountsInput = z.object({
  google: z.boolean().optional(),
  discord: z.boolean().optional(),
  github: z.boolean().optional(),
});

export const deleteAccountByUserIdInput = z.object({
  id: z.string(),
});

