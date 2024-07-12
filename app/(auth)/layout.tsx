import Image from "next/image";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-dvh w-full justify-between font-inter">
      {children}
      <div className="auth-asset">
        <div>
          <Image
            width={800}
            height={800}
            src="/icons/clearbank_app.jpg"
            alt="home page of clearbank app"
            quality={90}
            placeholder="empty"
          />
        </div>
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
