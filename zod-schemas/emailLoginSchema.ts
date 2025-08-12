import { z } from "zod";

export const emailLoginStep1Schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const emailLoginStep2Schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export const emailSignUpStep1Schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const emailSignUpStep2Schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  password_confirm: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  name: z.string().min(1, { message: "Your name is required" }),
  verification_code: z.string().optional(),
});

export const emailLoginSchema = z.object({
  step1: emailLoginStep1Schema,
  step2: emailLoginStep2Schema,
});

export const emailResetPasswordStep1Schema = z
  .object({
    resetCode: z.string().min(6, {
      message: "Reset code must be 6 characters long",
    }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    password_confirm: z.string().min(8, {
      message: "Password must be at least 8 characters long",
    }),
  })
  .refine((data) => data.password === data.password_confirm, {
    path: ["password_confirm"],
    message: "Passwords do not match",
  });

export type emailLoginStep1Type = z.infer<typeof emailLoginStep1Schema>;
export type emailLoginStep2Type = z.infer<typeof emailLoginStep2Schema>;
export type emailSignUpStep2Type = z.infer<typeof emailSignUpStep2Schema>;
export type emailResetPasswordStep1Type = z.infer<
  typeof emailResetPasswordStep1Schema
>;

export type EmailLoginType = z.infer<typeof emailLoginSchema>;
