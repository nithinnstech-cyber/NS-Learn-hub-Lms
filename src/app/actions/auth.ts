'use server';

import { prisma } from '@/lib/prisma';
import { SignupFormSchema, LoginFormSchema, FormState } from '@/lib/definitions';
import { createSession, deleteSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role') || 'STUDENT',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, role } = validatedFields.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return {
      errors: {
        email: ['An account with this email already exists.'],
      },
    };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role as 'STUDENT' | 'INSTRUCTOR',
    },
  });

  await createSession({
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  redirect('/dashboard');
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return {
      errors: {
        general: ['Invalid email or password.'],
      },
    };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return {
      errors: {
        general: ['Invalid email or password.'],
      },
    };
  }

  await createSession({
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  redirect('/dashboard');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
