import { Analytics } from "@/components/Analytics";
import { MobileNav } from "@/components/MobileNav";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { AppProvider } from "@/lib/providers/app.provider";
import type { AppState } from "@/lib/providers/app.provider";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect('/sign-in');
  }

  let accounts: Account[] = [];
  let totalCurrentBalance = 0;
  let totalBanks = 0;
  let accountDetails: AppState["accountDetails"] = {};

  const accountsRes = await getAccounts({ userId: user.$id });
  if (accountsRes) {
    accounts = accountsRes.data;
    totalBanks = accountsRes.totalBanks;
    totalCurrentBalance = accountsRes.totalCurrentBalance;
    const accountsData = accountsRes.data;
    const appwriteItemId = accountsData?.[0]?.appwriteItemId;

    if (appwriteItemId) {
      const accountRes = await getAccount({ appwriteItemId });
      if (accountRes) {
        accountDetails[appwriteItemId] = {
          info: accountRes.data,
          transactions: accountRes.transactions,
        };
      }
    }
  }

  return (
    <AppProvider
      user={user}
      accounts={accounts}
      totalBanks={totalBanks}
      totalCurrentBalance={totalCurrentBalance}
      accountDetails={accountDetails}
    >
      <main className="flex min-h-dvh w-full font-inter">
        <Sidebar />
        <div className="flex size-full flex-col">
          <div className="root-layout">
            <Image
              src="/icons/clearbank_logo.png"
              width={30}
              height={30}
              alt="menu icon"
            />
            <MobileNav />
          </div>
          {children}
        </div>
        <Analytics />
        <Toaster />
      </main>
    </AppProvider>
  );
}
