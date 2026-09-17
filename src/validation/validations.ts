import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Type, CategoryList } from '../../prisma/generated/prisma/enums';


export const createUserSchema = z.object({
  username: z.string().min(4).max(15),
  password: z.string().min(5).max(20)
});

export const createUserCategory = z.object({
  name: z.string(),
  monthLimit: z.number().min(1).max(9999999)
});

export const createUserTransaction = z.object({
  sum: z.number().min(1).max(9999999),
  type: z.nativeEnum(Type),
  category: z.nativeEnum(CategoryList),
  description: z.string().max(80).optional(),
  date: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
  }, z.date())
});

export const querySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

type CreateUserInput = z.infer<typeof createUserSchema>;
type createUserCategoryInput = z.infer<typeof createUserCategory>;
type createUserTransactionInput = z.infer<typeof createUserTransaction>;
type querySchemaInput = z.infer<typeof querySchema>;

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues,
        });
      }
      next(error);
    }
  }
}