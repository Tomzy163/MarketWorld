import { z } from 'zod';

const password = z
  .string()
  .min(12)
  .max(128)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/[0-9]/);

export const updateMeSchema = z.object({
  body: z
    .object({
      firstName: z.string().min(1).max(80).optional(),
      lastName: z.string().min(1).max(80).optional(),
      phone: z.string().min(7).max(32).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, 'At least one profile field is required.'),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1).max(128),
    newPassword: password,
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const sessionIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({}).default({}),
});
