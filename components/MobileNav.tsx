import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

export function MobileNav() {
  const pathname = usePathname();
  return (
    <section className="max-w-[264px]">
      <Sheet>
        <SheetTrigger>
          <Image
            src="/icons/hamburger.svg"
            alt="menu"
            width={30}
            height={30}
            className="cursor-pointer"
          />
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-white">
          <SheetClose asChild>
            <Link
              href="/"
              className="cursor-pointer flex items-center gap-2 px-4"
            >
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
          </SheetClose>
          <div className="mobilenav-sheet">
            <nav className="flex h-full flex-col gap-6 pt-16 text-white">
              {sidebarLinks.map((link) => {
                const isActive =
                  pathname === link.route ||
                  pathname.startsWith(`${link.route}/`);
                return (
                  <SheetClose asChild key={link.route}>
                    <Link
                      href={link.route}
                      className={cn("mobilenav-sheet_close w-full", {
                        "bg-bank-gradient": isActive,
                      })}
                    >
                      <Image
                        src={link.imgURL}
                        alt={link.label}
                        width={20}
                        height={20}
                        className={cn({
                          "brightness-[3] invert-0": isActive,
                        })}
                      />
                      <p
                        className={cn("text-16 font-semibold text-black-2", {
                          "text-white": isActive,
                        })}
                      >
                        {link.label}
                      </p>
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>
            <Footer type="mobile" />
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
