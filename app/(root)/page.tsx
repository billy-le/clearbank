"use client";

import { HeaderBox } from "@/components/HeaderBox";
import { RecentTransactions } from "@/components/RecentTransactions";
import { RightSidebar } from "@/components/RightSidebar";
import { TotalBalanceBox } from "@/components/TotalBalanceBox";
import { useGetAccountDetails } from "@/lib/hooks/useAccountDetails";
import { useAppState } from "@/lib/providers/app.provider";

export default async function Home({
  searchParams: { id, page },
}: SearchParamProps) {
  const pageNum = parseInt(page as string, 10);
  const currentPage = page && !isNaN(pageNum) ? pageNum : 1;
  const {
    state: { accounts, totalBanks, totalCurrentBalance, accountDetails },
  } = useAppState();

  useGetAccountDetails(id as string);

  const appwriteItemId = (id as string) ?? accounts?.[0]?.appwriteItemId;

  const transactions = accountDetails[appwriteItemId]?.transactions ?? [];

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            subtext="Access and manage your account and transactions efficiently"
          />
          <TotalBalanceBox
            accounts={accounts}
            totalBanks={totalBanks}
            totalCurrentBalance={totalCurrentBalance}
          />
        </header>
        <RecentTransactions
          accounts={accounts}
          appwriteItemId={appwriteItemId}
          page={currentPage}
          transactions={transactions}
        />
      </div>
      <RightSidebar transactions={transactions} />
    </section>
  );
}
