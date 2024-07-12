import { MobileNav } from "@/components/MobileNav";
import { Sidebar } from "@/components/Sidebar";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import Image from "next/image";
import { redirect } from "next/navigation";
import Script from "next/script";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getLoggedInUser();
  if (!user) redirect("/sign-in");

  return (
    <main className="flex min-h-dvh w-full font-inter">
      <Sidebar user={user} />
      <div className="flex size-full flex-col">
        <div className="root-layout">
          <Image
            src="/icons/clearbank_logo.png"
            width={30}
            height={30}
            alt="menu icon"
          />
          <MobileNav user={user} />
        </div>
        {children}
      </div>
      <Script
        defer
        data-domain="clearbank.billyle.dev"
        src="https://plausible-rgwwkgs.billyle.dev:8000/js/script.js"
        strategy="beforeInteractive"
      />
    </main>
  );
}
