"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CustomInput } from "./CustomInput";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/actions/user.actions";
import { authFormSchema } from "@/lib/schemas/auth";
import { PlaidLink } from "./PlaidLink";

export function AuthForm({ type }: { type: "sign-in" | "sign-up" }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const authSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      address1: "",
      city: "",
      state: "",
      postalCode: "",
      dateOfBirth: "",
      ssn: "",
    },
  });

  async function onSubmit(data: z.infer<typeof authSchema>) {
    setIsLoading(true);

    try {
      switch (type) {
        case "sign-up": {
          const newUser = await signUp({
            firstName: data.firstName!,
            lastName: data.lastName!,
            address1: data.address1!,
            city: data.city!,
            state: data.state!,
            dateOfBirth: data.dateOfBirth!,
            postalCode: data.postalCode!,
            ssn: data.ssn!,
            email: data.email,
            password: data.password,
          });
          setUser(newUser);
          break;
        }
        case "sign-in": {
          const response = await signIn({
            email: data.email,
            password: data.password,
          });
          if (response) router.push("/");
          break;
        }
        default:
          throw Error("AuthForm invalid type");
      }
    } catch (error) {
      console.error(error);
    }

    setIsLoading(false);
  }

  return (
    <section className="auth-form">
      <header className="flex flex-col gap-5 md:gap-8">
        <Link href="/" className="cursor-pointer flex items-center gap-1">
          <Image
            src="/icons/clearbank_logo.png"
            width={34}
            height={34}
            alt="ClearBank Logo"
          />
          <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">
            ClearBank
          </h1>
        </Link>
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            {user ? "Link Account" : type === "sign-in" ? "Log In" : "Sign Up"}
          </h1>
          {
            <p className="text-16 font-normal text-gray-500">
              {user
                ? "Link your account to get started"
                : "Please enter your details"}
            </p>
          }
        </div>
      </header>
      {user ? (
        <div className="flex flex-col gap-4">
          <PlaidLink user={user} variant="primary" />
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {type === "sign-up" && (
                <>
                  <div className="flex gap-4">
                    <CustomInput
                      form={form}
                      name="firstName"
                      label="First Name"
                      placeholder="ex. John"
                    />
                    <CustomInput
                      form={form}
                      name="lastName"
                      label="Last Name"
                      placeholder="ex. Doe"
                    />
                  </div>
                  <CustomInput
                    form={form}
                    name="address1"
                    label="Address"
                    placeholder="Enter your specific address"
                  />
                  <CustomInput
                    form={form}
                    name="city"
                    label="City"
                    placeholder="Enter your city"
                  />
                  <div className="flex gap-4">
                    <CustomInput
                      form={form}
                      name="state"
                      label="State"
                      placeholder="ex. NY"
                    />
                    <CustomInput
                      form={form}
                      name="postalCode"
                      label="Postal Code"
                      placeholder="ex. 11011"
                    />
                  </div>
                  <div className="flex gap-4">
                    <CustomInput
                      form={form}
                      name="dateOfBirth"
                      label="Date Of Birth"
                      placeholder="YYYY-MM-DD"
                    />
                    <CustomInput
                      form={form}
                      name="ssn"
                      label="SSN"
                      placeholder="ex. 123456789"
                    />
                  </div>
                </>
              )}
              <CustomInput
                form={form}
                name="email"
                label="Email"
                placeholder="Enter your email"
              />
              <CustomInput
                form={form}
                name="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
              />
              <div className="flex flex-col gap-4">
                <Button type="submit" className="form-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      &nbsp;Loading...
                    </>
                  ) : type === "sign-in" ? (
                    "Log in"
                  ) : (
                    "Sign up"
                  )}
                </Button>
              </div>
            </form>
          </Form>
          <footer className="flex justify-center gap-1">
            <p className="text-14 font-normal text-gray-600">
              {type === "sign-in"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="form-link"
            >
              {type === "sign-in" ? "Sign up" : "Sign in"}
            </Link>
          </footer>
        </>
      )}
    </section>
  );
}
