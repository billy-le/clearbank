import { HeaderBox } from "@/components/HeaderBox";
import { RightSidebar } from "@/components/RightSidebar";
import { TotalBalanceBox } from "@/components/TotalBalanceBox";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getLoggedInUser();
  if (!user) redirect("/sign-in");

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={user?.name || "Guest"}
            subtext="Access and manage your account and transactions efficiently"
          />
          <TotalBalanceBox
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={1602.55}
          />
        </header>
        <h2>RECENT TRANSACTIONS</h2>
      </div>
      <RightSidebar
        user={user}
        transactions={[]}
        banks={[
          {
            name: "Bank 1",
            currentBalance: 5729.0,
          },
          { name: "Bank 2", currentBalance: 7782.12 },
        ]}
      />
    </section>
  );
}
