"use client";

import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { PlaidLink } from "./PlaidLink";
import { useAppState } from "@/lib/providers/app.provider";

export function Sidebar() {
  const {
    state: { user },
  } = useAppState();
  if (!user) return;
  const pathname = usePathname();
  return (
    <section className="sidebar">
      <nav className="flex flex-col gap-4">
        <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2">
          <Image
            src="/icons/clearbank_logo.png"
            width={34}
            height={34}
            alt="ClearBank Logo"
            className="size-6 max-xl:size-14"
          />
          <h1 className="sidebar-logo">ClearBank</h1>
        </Link>
        {sidebarLinks.map((link) => {
          const isActive =
            pathname === link.route || pathname.startsWith(`${link.route}/`);
          return (
            <Link
              key={link.label}
              href={link.route}
              className={cn("sidebar-link", {
                "bg-bank-gradient": isActive,
              })}
            >
              <div className="relative size-6">
                <Image
                  fill
                  src={link.imgURL}
                  alt={link.label}
                  className={cn({
                    "brightness-[3] invert-0": isActive,
                  })}
                />
              </div>
              <p
                className={cn("sidebar-label", {
                  "!text-white": isActive,
                })}
              >
                {link.label}
              </p>
            </Link>
          );
        })}
        <PlaidLink user={user} variant="ghost" />
      </nav>
      <Footer type="desktop" />
    </section>
  );
}
