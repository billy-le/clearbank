"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";

export function Footer({ user, type }: FooterProps) {
  const router = useRouter();
  async function handleSignOut() {
    const signedOut = await signOut();
    if (signedOut) {
      router.push("/sign-in");
    }
  }

  return (
    <footer className="footer">
      <div
        className={type === "desktop" ? "footer_name" : "footer_name-mobile"}
      >
        <p className="text-xl font-bold text-gray-700">
          {user.firstName.substring(0, 2)}
        </p>
      </div>
      <div
        className={type === "desktop" ? "footer_email" : "footer_email-mobile"}
      >
        <h1 className="text-14 truncate font-normal text-gray-600">{`${user.firstName} ${user.lastName}`}</h1>
        <p className="text-14 truncate font-normal text-gray-600">
          {user.email}
        </p>
      </div>
      <Button className="footer_image" onClick={handleSignOut}>
        <Image fill src="/icons/logout.svg" alt="logout" />
      </Button>
    </footer>
  );
}
