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
        ? z.string({ message: "State is required" }).refine(
            (value) => {
              const states = [
                "IA",
                "KS",
                "UT",
                "VA",
                "NC",
                "NE",
                "SD",
                "AL",
                "ID",
                "FM",
                "DE",
                "AK",
                "CT",
                "PR",
                "NM",
                "MS",
                "PW",
                "CO",
                "NJ",
                "FL",
                "MN",
                "VI",
                "NV",
                "AZ",
                "WI",
                "ND",
                "PA",
                "OK",
                "KY",
                "RI",
                "NH",
                "MO",
                "ME",
                "VT",
                "GA",
                "GU",
                "AS",
                "NY",
                "CA",
                "HI",
                "IL",
                "TN",
                "MA",
                "OH",
                "MD",
                "MI",
                "WY",
                "WA",
                "OR",
                "MH",
                "SC",
                "IN",
                "LA",
                "MP",
                "DC",
                "MT",
                "AR",
                "WV",
                "TX",
              ];
              return states.includes(value);
            },
            {
              message: "Please enter a valid US State",
            }
          )
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
        ? z.string({ message: "SSN is required" }).refine(
            (value) => {
              const parts = value.split("-");
              const firstPart = parts[0];
              const secondPart = parts[1];
              const thirdPart = parts[2];

              if (!firstPart || !secondPart || !thirdPart) {
                return false;
              }

              if (firstPart.length !== 3) {
                return false;
              }

              if (secondPart.length !== 2) {
                return false;
              }

              if (thirdPart.length !== 4) {
                return false;
              }

              return true;
            },
            { message: "Invalid SSN" }
          )
        : z.string().optional(),
    // both
    email: z
      .string({ message: "Email is required" })
      .email({ message: "Email is invalid" })
      .trim(),
    password: z
      .string({ message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" })
      .trim(),
  });
