import { z } from "zod";

export const authFormSchema = (type: "sign-in" | "sign-up") =>
  z.object({
    // sign-up
    firstName:
      type === "sign-up"
        ? z
            .string({
              message: "First name is required",
            })
            .min(2, {
              message: "First name must be at least 2 characters",
            })
        : z.string().optional(),
    lastName:
      type === "sign-up"
        ? z
            .string({
              message: "Last name is required",
            })
            .min(2, {
              message: "Last name must be at least 2 characters",
            })
        : z.string().optional(),
    address1:
      type === "sign-up"
        ? z
            .string({ message: "Address is required" })
            .min(3, { message: "Address must be at least 3 characters" })
            .max(50, {
              message: "Address must be less than or equal to 50 characters",
            })
        : z.string().optional(),
    city:
      type === "sign-up"
        ? z
            .string({ message: "City is required" })
            .min(3, { message: "City must be at least 3 characters" })
            .max(30, {
              message: "City must be less than or equal to 30 characters",
            })
        : z.string().optional(),
    state:
      type === "sign-up"
        ? z
            .string({ message: "State is required" })
            .min(2, { message: "State must be 2 characters" })
            .max(2, { message: "State must be 2 characters" })
        : z.string().optional(),
    postalCode:
      type === "sign-up"
        ? z
            .string({
              message: "Postal Code is required",
            })
            .min(5, { message: "Postal Code must be at least 5 characters" })
        : z.string().optional(),
    dateOfBirth:
      type === "sign-up"
        ? z
            .string({ message: "Date of Birth is required" })
            .min(10, { message: "Date of Birth must be 10 characters" })
        : z.string().optional(),
    ssn:
      type === "sign-up"
        ? z
            .string({ message: "SSN is required" })
            .min(9, { message: "SSN must be 9 characters" })
            .max(9, { message: "SSN must be 9 characters" })
        : z.string().optional(),
    // both
    email: z
      .string({ message: "Email is required" })
      .email({ message: "Email is invalid" }),
    password: z
      .string({ message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" }),
  });
