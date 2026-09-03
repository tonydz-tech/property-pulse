"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

export async function signup(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name.trim() ||
    !email.trim() ||
    password.length < 8
  ) {
    return "Please fill out every field. Password must be at least 8 characters.";
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.landlord.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return "An account with that email already exists.";
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.landlord.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    },
  });

  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Account created, but sign-in failed. Please log in.";
    }
    throw error;
  }
}
