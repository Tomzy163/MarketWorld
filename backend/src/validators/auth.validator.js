import { z } from 'zod';

const password = z
  .string()
  .min(12)
  .max(128)
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/[0-9]/, 'Password must include a number.');

export const registerSchema = z
  .object({
    body: z.object({
      email: z.string().email(),
      phone: z.string().min(7).max(32).optional(),
      password,
      firstName: z.string().min(1).max(80),
      lastName: z.string().min(1).max(80),
      role: z.enum(['customer', 'seller']).default('customer'),
      businessName: z.string().min(2).max(160).optional(),
      legalName: z.string().min(2).max(200).optional(),
      storeName: z.string().min(2).max(160).optional(),
      storeSlug: z
        .string()
        .min(3)
        .max(80)
        .regex(/^[a-z0-9-]+$/)
        .optional(),
      storeDescription: z.string().max(2000).optional(),
    }),
    params: z.object({}).default({}),
    query: z.object({}).default({}),
  })
  .superRefine((value, context) => {
    if (value.body.role === 'seller' && !value.body.businessName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['body', 'businessName'],
        message: 'Seller registration requires a business name.',
      });
    }
  });

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1).max(128),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const verifyEmailSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    token: z.string().min(32),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(32),
    password,
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});
