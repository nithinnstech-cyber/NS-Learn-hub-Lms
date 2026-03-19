import { z } from 'zod';

export const SignupFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).trim(),
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .trim(),
  role: z.enum(['STUDENT', 'INSTRUCTOR']).default('STUDENT'),
});

export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z.string().min(1, { message: 'Password is required.' }).trim(),
});

export type FormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
    general?: string[];
  };
  message?: string;
  success?: boolean;
} | undefined;
