import { HeaderBox } from "@/components/HeaderBox";
import { RecentTransactions } from "@/components/RecentTransactions";
import { RightSidebar } from "@/components/RightSidebar";
import { TotalBalanceBox } from "@/components/TotalBalanceBox";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";

export default async function Home({
  searchParams: { id, page },
}: SearchParamProps) {
  const pageNum = parseInt(page as string, 10);
  const currentPage = page && !isNaN(pageNum) ? pageNum : 1;
  const user = await getLoggedInUser();
  if (!user) return null;
  const accounts = await getAccounts({ userId: user!.$id });
  if (!accounts) return null;

  const accountsData = accounts.data;
  const appwriteItemId = (id as string) ?? accountsData?.[0]?.appwriteItemId;

  let account: {
    data: Account;
    transactions: Transaction[];
  } | null = null;

  if (appwriteItemId) {
    account = await getAccount({ appwriteItemId });
  }

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={`${user!.firstName} ${user!.lastName}`}
            subtext="Access and manage your account and transactions efficiently"
          />
          <TotalBalanceBox
            accounts={accountsData}
            totalBanks={accounts.totalBanks}
            totalCurrentBalance={accounts.totalCurrentBalance}
          />
        </header>
        <RecentTransactions
          accounts={accountsData}
          appwriteItemId={appwriteItemId}
          page={currentPage}
          transactions={account?.transactions ?? []}
        />
      </div>
      <RightSidebar
        user={user!}
        transactions={account?.transactions!}
        banks={accountsData.slice(0, 2)}
      />
    </section>
  );
}
