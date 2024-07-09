import Image from "next/image";

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
    </main>
  );
}
